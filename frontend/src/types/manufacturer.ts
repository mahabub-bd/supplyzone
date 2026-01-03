import { BaseEntity } from "./index";

export interface Manufacturer extends BaseEntity {
  name: string;
  manufacturer_code: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  status: boolean;
  total_products?: number;
  logo_attachment_id?: number | null;
  logo_attachment?: {
    id: number;
    file_name: string;
    url: string;
    mime_type?: string;
    size?: string | number;
  } | null;
}

export interface CreateManufacturerPayload {
  name: string;
  manufacturer_code?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  status?: boolean;
  logo_attachment_id?: number;
}

export interface UpdateManufacturerPayload {
  id: string | number;
  body: Partial<CreateManufacturerPayload>;
}

export interface ManufacturerFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: boolean;
  city?: string;
  country?: string;
}

export interface ManufacturerListResponse {
  data: Manufacturer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ManufacturerDetailResponse {
  data: Manufacturer;
}