import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { BillingAddressDto } from './dto/billing-address.dto';
import { ShippingAddressDto } from './dto/shipping-address.dto';
@ApiTags('Customers')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('customers')
export class CustomerController {
  constructor(private service: CustomerService) {}

  @Post()
  @Permissions('customer.create')
  @ApiOperation({ summary: 'Create new customer' })
  create(@Body() dto: CreateCustomerDto) {
    return this.service.create(dto);
  }

  @Get()
  @Permissions('customer.view')
  @ApiOperation({ summary: 'List all customers (search + pagination)' })
  @ApiQuery({ name: 'search', required: false, description: 'Name or phone' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  findAll(
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.service.findAll(search, Number(page), Number(limit));
  }

  @Permissions('customer.view')
  @Get(':id')
  @ApiOperation({ summary: 'Get single customer' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Permissions('customer.update')
  @ApiOperation({ summary: 'Update customer' })
  update(@Param('id') id: number, @Body() dto: UpdateCustomerDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('customer.delete')
  @ApiOperation({ summary: 'Delete customer' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }

  @Post(':id/reward-points/add')
  @Permissions('customer.update')
  @ApiOperation({ summary: 'Add reward points to customer' })
  addRewardPoints(
    @Param('id') id: number,
    @Body() body: { points: number },
  ) {
    return this.service.addRewardPoints(id, body.points);
  }

  @Post(':id/reward-points/redeem')
  @Permissions('customer.update')
  @ApiOperation({ summary: 'Redeem reward points from customer' })
  redeemRewardPoints(
    @Param('id') id: number,
    @Body() body: { points: number },
  ) {
    return this.service.redeemRewardPoints(id, body.points);
  }

  @Patch(':id/billing-address')
  @Permissions('customer.update')
  @ApiOperation({ summary: 'Update or create billing address' })
  updateBillingAddress(
    @Param('id') id: number,
    @Body() dto: BillingAddressDto,
  ) {
    return this.service.updateBillingAddress(id, dto);
  }

  @Patch(':id/shipping-address')
  @Permissions('customer.update')
  @ApiOperation({ summary: 'Update or create shipping address' })
  updateShippingAddress(
    @Param('id') id: number,
    @Body() dto: ShippingAddressDto,
  ) {
    return this.service.updateShippingAddress(id, dto);
  }
}
