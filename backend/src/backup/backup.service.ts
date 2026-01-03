import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { exec } from 'child_process';
import { format } from 'date-fns';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { promisify } from 'util';
import { v4 as uuid } from 'uuid';
import { Backup, BackupStatus, BackupType } from './entities/backup.entity';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private s3: S3Client;

  constructor(
    @InjectRepository(Backup)
    private readonly backupRepository: Repository<Backup>,
  ) {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION,
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
      },
    });
  }

  /**
   * Create manual database backup and upload to S3
   */
  async createManualBackup(
    createdBy: string,
    description?: string,
  ): Promise<Backup> {
    return this.createBackup(BackupType.MANUAL, createdBy, description);
  }

  /**
   * Create scheduled database backup and upload to S3
   */
  async createScheduledBackup(): Promise<Backup> {
    return this.createBackup(BackupType.SCHEDULED, 'system');
  }

  /**
   * Core backup logic - dump database and upload to S3
   */
  private async createBackup(
    backupType: BackupType,
    createdBy: string,
    description?: string,
  ): Promise<Backup> {
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
    const fileName = `backup-${timestamp}.sql`;

    // Create backup record in database
    const backup = this.backupRepository.create({
      file_name: fileName,
      s3_url: '',
      s3_region: process.env.AWS_REGION || 'ap-southeast-1',
      s3_bucket: process.env.AWS_S3_BUCKET_NAME,
      backup_type: backupType,
      status: BackupStatus.PENDING,
      message: description || 'Backup initiated',
      created_by: createdBy,
    });

    const savedBackup = await this.backupRepository.save(backup);

    // Perform backup asynchronously
    this.performBackup(savedBackup.id, fileName).catch((error) => {
      this.logger.error(`Backup failed for ID ${savedBackup.id}:`, error);
    });

    return savedBackup;
  }

  /**
   * Perform the actual database dump and S3 upload
   */
  private async performBackup(backupId: number, fileName: string) {
    const backup = await this.backupRepository.findOne({ where: { id: backupId } });
    if (!backup) {
      throw new NotFoundException('Backup record not found');
    }

    const tempFilePath = path.join(process.cwd(), 'temp', fileName);

    try {
      // Update status to in progress
      await this.backupRepository.update(backupId, {
        status: BackupStatus.IN_PROGRESS,
        message: 'Creating database dump...',
      });

      // Ensure temp directory exists
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Create PostgreSQL dump
      await this.createDatabaseDump(tempFilePath);

      // Get file size
      const stats = fs.statSync(tempFilePath);

      // Upload to S3
      this.logger.log(`Uploading backup ${fileName} to S3...`);
      await this.uploadToS3(tempFilePath, fileName);

      // Generate S3 URL
      const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/backups/${fileName}`;

      // Update backup record with success
      await this.backupRepository.update(backupId, {
        status: BackupStatus.COMPLETED,
        s3_url: s3Url,
        file_size: stats.size,
        message: 'Backup completed successfully',
      });

      this.logger.log(`Backup ${fileName} completed successfully`);

      // Clean up temp file
      fs.unlinkSync(tempFilePath);
    } catch (error) {
      this.logger.error(`Backup failed:`, error);

      // Update backup record with failure
      await this.backupRepository.update(backupId, {
        status: BackupStatus.FAILED,
        message: `Backup failed: ${error.message}`,
      });

      // Clean up temp file if exists
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      throw error;
    }
  }

  /**
   * Create PostgreSQL database dump using pg_dump or pure Node.js
   */
  private async createDatabaseDump(outputPath: string): Promise<void> {
    const {
      DATABASE_HOST = 'localhost',
      DATABASE_PORT = '5432',
      DATABASE_NAME,
      DATABASE_USER,
      DATABASE_PASSWORD,
    } = process.env;

    if (!DATABASE_NAME || !DATABASE_USER || !DATABASE_PASSWORD) {
      throw new InternalServerErrorException(
        'Database credentials not configured',
      );
    }

    const pgDumpPath = this.findPgDumpPath();

    // If pg_dump is found, use it (faster and more reliable)
    if (pgDumpPath && fs.existsSync(pgDumpPath)) {
      this.logger.log(`Using pg_dump at: ${pgDumpPath}`);
      return this.createDumpWithPgDump(pgDumpPath, DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME, outputPath);
    }

    // Fallback: Use Node.js to dump schema and data
    this.logger.warn('pg_dump not found, using Node.js fallback (slower)');
    return this.createDumpWithNodeJs(DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME, outputPath);
  }

  /**
   * Create dump using pg_dump executable (preferred method)
   */
  private async createDumpWithPgDump(
    pgDumpPath: string,
    host: string,
    port: string,
    user: string,
    password: string,
    database: string,
    outputPath: string,
  ): Promise<void> {
    const command = `"${pgDumpPath}" -h ${host} -p ${port} -U ${user} -d ${database} --no-password --clean > "${outputPath}"`;

    this.logger.log(`Creating database dump with pg_dump...`);

    // Set PGPASSWORD environment variable for authentication
    const env = {
      ...process.env,
      PGPASSWORD: password,
    };

    try {
      await execAsync(command, { env });
      this.logger.log(`Database dump created successfully`);
    } catch (error) {
      this.logger.error('pg_dump failed:', error);
      throw new InternalServerErrorException(
        `Failed to create database dump: ${error.message}`,
      );
    }
  }

  /**
   * Create dump using pure Node.js (fallback when pg_dump is not available)
   * This exports the schema and data as SQL statements
   */
  private async createDumpWithNodeJs(
    host: string,
    port: string,
    user: string,
    password: string,
    database: string,
    outputPath: string,
  ): Promise<void> {
    this.logger.log('Creating database dump using Node.js client...');

    const { Pool } = require('pg');

    const pool = new Pool({
      host,
      port: parseInt(port),
      user,
      password,
      database,
    });

    let sqlDump = '';
    sqlDump += `-- PostgreSQL Database Dump\n`;
    sqlDump += `-- Generated: ${new Date().toISOString()}\n`;
    sqlDump += `-- Host: ${host}\n`;
    sqlDump += `-- Database: ${database}\n\n`;

    try {
      const client = await pool.connect();

      try {
        // Get all tables
        const tablesResult = await client.query(`
          SELECT tablename
          FROM pg_tables
          WHERE schemaname = 'public'
          ORDER BY tablename;
        `);

        const tables = tablesResult.rows.map((row: any) => row.tablename);
        this.logger.log(`Dumping ${tables.length} tables...`);

        // Dump schema for each table
        for (const table of tables) {
          sqlDump += `--\n-- Table structure for table "${table}"\n--\n\n`;
          sqlDump += `DROP TABLE IF EXISTS "${table}" CASCADE;\n\n`;

          // Get column information
          const columnsResult = await client.query(`
            SELECT
              column_name,
              data_type,
              character_maximum_length,
              is_nullable,
              column_default,
              ordinal_position
            FROM information_schema.columns
            WHERE table_name = $1
            ORDER BY ordinal_position;
          `, [table]);

          // Build CREATE TABLE statement
          if (columnsResult.rows.length > 0) {
            let createTable = `CREATE TABLE "${table}" (\n`;
            const columnDefs = columnsResult.rows.map((col: any) => {
              let colDef = `  "${col.column_name}" ${col.data_type}`;

              if (col.character_maximum_length) {
                colDef += `(${col.character_maximum_length})`;
              }

              if (col.is_nullable === 'NO') {
                colDef += ' NOT NULL';
              }

              if (col.column_default) {
                colDef += ` DEFAULT ${col.column_default}`;
              }

              return colDef;
            });

            createTable += columnDefs.join(',\n');
            createTable += '\n);\n\n';
            sqlDump += createTable;
          }
        }

        // Dump data for each table
        for (const table of tables) {
          sqlDump += `--\n-- Data for table "${table}"\n--\n\n`;
          sqlDump += `ALTER TABLE "${table}" DISABLE TRIGGER ALL;\n\n`;

          const dataResult = await client.query(`SELECT * FROM "${table}"`);
          const columns = dataResult.fields.map((f: any) => f.name);

          for (const row of dataResult.rows) {
            const values = columns.map((col: any) => {
              const val = row[col];
              if (val === null) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
              if (val instanceof Date) return `'${val.toISOString()}'`;
              return String(val);
            });

            sqlDump += `INSERT INTO "${table}" (${columns.map((c: any) => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
          }

          sqlDump += `\nALTER TABLE "${table}" ENABLE TRIGGER ALL;\n\n`;
        }

        sqlDump += `-- Dump completed\n`;

        // Write to file
        fs.writeFileSync(outputPath, sqlDump, 'utf8');
        this.logger.log(`Database dump created successfully`);

      } finally {
        client.release();
      }
    } catch (error) {
      this.logger.error('Node.js dump failed:', error);
      throw new InternalServerErrorException(
        `Failed to create database dump: ${error.message}`,
      );
    } finally {
      await pool.end();
    }
  }

  /**
   * Find pg_dump executable path based on OS
   */
  private findPgDumpPath(): string {
    const isWindows = process.platform === 'win32';
    const commonPaths = isWindows
      ? [
          'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe',
          'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe',
          'C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe',
          'C:\\PostgreSQL\\16\\bin\\pg_dump.exe',
          'C:\\PostgreSQL\\15\\bin\\pg_dump.exe',
        ]
      : [
          '/usr/bin/pg_dump',
          '/usr/local/bin/pg_dump',
          '/Library/PostgreSQL/16/bin/pg_dump',
          '/Library/PostgreSQL/15/bin/pg_dump',
        ];

    // Check if pg_dump is in PATH
    try {
      execAsync('which pg_dump')
        .then(({ stdout }) => {
          if (stdout.trim()) return stdout.trim();
        })
        .catch(() => {
          // Ignore error, will check common paths
        });
    } catch {
      // Continue to common paths
    }

    // Check common paths
    for (const pgPath of commonPaths) {
      if (fs.existsSync(pgPath)) {
        this.logger.log(`Found pg_dump at: ${pgPath}`);
        return pgPath;
      }
    }

    // Fallback: assume it's in PATH
    this.logger.warn('pg_dump not found in common paths, assuming it is in PATH');
    return isWindows ? 'pg_dump.exe' : 'pg_dump';
  }

  /**
   * Upload backup file to S3
   */
  private async uploadToS3(filePath: string, fileName: string): Promise<void> {
    const fileContent = fs.readFileSync(filePath);

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `backups/${fileName}`,
      Body: fileContent,
      ContentType: 'application/octet-stream',
    };

    try {
      await this.s3.send(new PutObjectCommand(params));
      this.logger.log(`File ${fileName} uploaded to S3 successfully`);
    } catch (error) {
      this.logger.error('S3 upload failed:', error);
      throw new InternalServerErrorException(
        `Failed to upload backup to S3: ${error.message}`,
      );
    }
  }

  /**
   * Get all backups
   */
  async getAllBackups(): Promise<Backup[]> {
    return this.backupRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get backup by ID
   */
  async getBackupById(id: number): Promise<Backup> {
    const backup = await this.backupRepository.findOne({ where: { id } });
    if (!backup) {
      throw new NotFoundException(`Backup with ID ${id} not found`);
    }
    return backup;
  }

  /**
   * Get latest backup
   */
  async getLatestBackup(): Promise<Backup | null> {
    return this.backupRepository.findOne({
      where: { status: BackupStatus.COMPLETED },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Delete backup record (Note: S3 file is not deleted for safety)
   */
  async deleteBackupRecord(id: number): Promise<void> {
    const backup = await this.getBackupById(id);
    await this.backupRepository.remove(backup);
  }
}
