import { Injectable } from '@nestjs/common';
import dbInstance from '../../Database/dbConn/nodeDB';
import { LeadServiceType } from '../dto/leads.dto';

@Injectable()
export class LeadsService {
  async createLead(
    serviceType: LeadServiceType,
    payload: Record<string, string>
  ): Promise<{ id: number }>
  {
    const query = `
      INSERT INTO leads (service_type, city, pincode, phone, extra)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const extra: Record<string, string> = { ...payload };
    delete extra.city;
    delete extra.pincode;
    delete extra.phone;

    const values = [
      serviceType,
      payload.city,
      payload.pincode,
      payload.phone,
      Object.keys(extra).length ? JSON.stringify(extra) : null
    ];

    const result = await dbInstance.query(query, values);
    return { id: result.rows[0].id };
  }
}


