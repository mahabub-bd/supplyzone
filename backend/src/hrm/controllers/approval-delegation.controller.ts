import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { CreateApprovalDelegationDto } from '../dto/create-approval-delegation.dto';
import { UpdateApprovalDelegationDto } from '../dto/update-approval-delegation.dto';
import {
  ApprovalDelegation,
  DelegationType,
} from '../entities/approval-delegation.entity';
import { ApprovalDelegationService } from '../services/approval-delegation.service';

@ApiTags('HRM - Approval Delegations')
@Controller('approval-delegations')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ApprovalDelegationController {
  constructor(
    private readonly approvalDelegationService: ApprovalDelegationService,
  ) {}

  @Post()
  @Permissions('delegation.create')
  @ApiOperation({ summary: 'Create a new approval delegation' })
  // @ApiResponse({
  //   status: HttpStatus.CREATED,
  //   description: 'Approval delegation created successfully.',
  //   type: ApprovalDelegation,
  // })
  async create(
    @Body() createApprovalDelegationDto: CreateApprovalDelegationDto,
  ) {
    return {
      success: true,
      message: 'Approval delegation created successfully',
      data: await this.approvalDelegationService.create(
        createApprovalDelegationDto,
      ),
    };
  }

  @Get()
  @Permissions('delegation.view')
  @ApiOperation({ summary: 'Get all approval delegations' })
  @ApiQuery({
    name: 'delegatorId',
    required: false,
    type: String,
    description: 'Filter by delegator ID',
  })
  @ApiQuery({
    name: 'delegateeId',
    required: false,
    type: String,
    description: 'Filter by delegatee ID',
  })
  @ApiQuery({
    name: 'delegationType',
    required: false,
    enum: DelegationType,
    description: 'Filter by delegation type',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Approval delegations retrieved successfully.',
  })
  async findAll(
    @Query('delegatorId') delegatorId?: string,
    @Query('delegateeId') delegateeId?: string,
    @Query('delegationType') delegationType?: DelegationType,
    @Query('isActive') isActive?: boolean,
    @Query('branch_id') branch_id?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.approvalDelegationService.findAll({
      delegatorId,
      delegateeId,
      delegationType,
      isActive,
      branch_id,
      page: page || 1,
      limit: limit || 10,
    });

    return {
      success: true,
      message: 'Approval delegations retrieved successfully',
      ...result,
    };
  }

  @Get(':id')
  @Permissions('delegation.view')
  @ApiOperation({ summary: 'Get approval delegation by ID' })
  @ApiParam({
    name: 'id',
    description: 'Approval delegation ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Approval delegation retrieved successfully.',
    type: ApprovalDelegation,
  })
  async findOne(@Param('id') id: number) {
    const delegation = await this.approvalDelegationService.findOne(id);

    return {
      success: true,
      message: 'Approval delegation retrieved successfully',
      data: delegation,
    };
  }

  @Patch(':id')
  @Permissions('delegation.update')
  @ApiOperation({ summary: 'Update approval delegation' })
  @ApiParam({
    name: 'id',
    description: 'Approval delegation ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Approval delegation updated successfully.',
    type: ApprovalDelegation,
  })
  async update(
    @Param('id') id: number,
    @Body() updateApprovalDelegationDto: UpdateApprovalDelegationDto,
  ) {
    const delegation = await this.approvalDelegationService.update(
      id,
      updateApprovalDelegationDto,
    );

    return {
      success: true,
      message: 'Approval delegation updated successfully',
      data: delegation,
    };
  }

  @Delete(':id')
  @Permissions('delegation.delete')
  @ApiOperation({ summary: 'Delete approval delegation' })
  @ApiParam({
    name: 'id',
    description: 'Approval delegation ID',
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Approval delegation deleted successfully.',
  })
  async remove(@Param('id') id: number) {
    await this.approvalDelegationService.remove(id);

    return {
      success: true,
      message: 'Approval delegation deleted successfully',
    };
  }

  @Get('active/delegator/:delegatorId')
  @Permissions('delegation.view')
  @ApiOperation({ summary: 'Get active delegations for a delegator' })
  @ApiParam({
    name: 'delegatorId',
    description: 'Delegator ID',
    type: String,
  })
  @ApiQuery({
    name: 'delegationType',
    required: false,
    enum: DelegationType,
    description: 'Filter by delegation type',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active delegations retrieved successfully.',
  })
  async getActiveDelegationsForDelegator(
    @Param('delegatorId') delegatorId: number,
    @Query('delegationType') delegationType?: DelegationType,
  ) {
    const delegations =
      await this.approvalDelegationService.getActiveDelegationsForDelegator(
        delegatorId,
        delegationType,
      );

    return {
      success: true,
      message: 'Active delegations retrieved successfully',
      data: delegations,
    };
  }

  @Get('active/delegatee/:delegateeId')
  @Permissions('delegation.view')
  @ApiOperation({ summary: 'Get active delegations received by a delegatee' })
  @ApiParam({
    name: 'delegateeId',
    description: 'Delegatee ID',
    type: String,
  })
  @ApiQuery({
    name: 'delegationType',
    required: false,
    enum: DelegationType,
    description: 'Filter by delegation type',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active delegations retrieved successfully.',
  })
  async getActiveDelegationsForDelegatee(
    @Param('delegateeId') delegateeId: number,
    @Query('delegationType') delegationType?: DelegationType,
  ) {
    const delegations =
      await this.approvalDelegationService.getActiveDelegationsForDelegatee(
        delegateeId,
        delegationType,
      );

    return {
      success: true,
      message: 'Active delegations retrieved successfully',
      data: delegations,
    };
  }

  @Patch(':id/deactivate')
  @Permissions('delegation.update')
  @ApiOperation({ summary: 'Deactivate approval delegation' })
  @ApiParam({
    name: 'id',
    description: 'Approval delegation ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Approval delegation deactivated successfully.',
  })
  async deactivate(@Param('id') id: number) {
    await this.approvalDelegationService.deactivate(id);

    return {
      success: true,
      message: 'Approval delegation deactivated successfully',
    };
  }

  @Post(':id/use')
  @Permissions('delegation.use')
  @ApiOperation({ summary: 'Mark delegation as used' })
  @ApiParam({
    name: 'id',
    description: 'Approval delegation ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delegation marked as used successfully.',
  })
  async useDelegation(@Param('id') id: number) {
    await this.approvalDelegationService.useDelegation(id);

    return {
      success: true,
      message: 'Delegation marked as used successfully',
    };
  }
}
