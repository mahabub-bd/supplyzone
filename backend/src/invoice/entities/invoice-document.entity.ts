import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('invoice_documents')
export class InvoiceDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: 'sale' | 'purchase' | 'quotation';

  @Column()
  reference_id: number; // sale_id / purchase_id / quotation_id

  @Column()
  document_no: string;

  @Column({ nullable: true })
  pdf_url: string;

  @CreateDateColumn()
  created_at: Date;
}
