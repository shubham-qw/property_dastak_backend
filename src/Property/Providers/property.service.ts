import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import dbInstance from '../../Database/dbConn/nodeDB';
import { 
  CreatePropertyDto, 
  UpdatePropertyDto, 
  PropertyResponseDto,
  PropertyDetailsResponseDto,
  ParkingResponseDto,
  PropertyFor,
  AvailabilityStatus,
  Ownership,
  ParkingType
} from '../dto/property.dto';

@Injectable()
export class PropertyService {
  async createProperty(createPropertyDto: CreatePropertyDto, userId: string): Promise<PropertyResponseDto> {
    const client = await dbInstance.connection();
    
    try {
      await client.query('BEGIN');

      // Extract property details and parking from the DTO
      const { property_details, parking, ...propertyData } = createPropertyDto;

      // Insert main property
      const propertyQuery = `
        INSERT INTO properties (
          title, property_for, property_type, city, locality, sub_locality, 
          apartment, availability_status, property_age, ownership, 
          price_per_sqft, brokerage_charge, description, property_features, property_amenities,property_size,created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,$16,$17)
        RETURNING *
      `;

      const propertyValues = [
        propertyData.title,
        propertyData.property_for,
        propertyData.property_type,
        propertyData.city,
        propertyData.locality,
        propertyData.sub_locality,
        propertyData.apartment,
        propertyData.availability_status,
        propertyData.property_age,
        propertyData.ownership,
        propertyData.price_per_sqft,
        propertyData.brokerage_charge,
        propertyData.description,
        propertyData.property_features,
        propertyData.property_amenities,
        propertyData.property_size,
        userId
      ];

      const propertyResult = await client.query(propertyQuery, propertyValues);
      const newProperty = propertyResult.rows[0];

      // Insert property details if provided
      let propertyDetails: PropertyDetailsResponseDto | undefined;
      if (property_details) {
        const detailsQuery = `
          INSERT INTO property_details (property_id, rooms, bathrooms, balconies, other_rooms, floors)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `;
        const detailsValues = [
          newProperty.id,
          property_details.rooms,
          property_details.bathrooms,
          property_details.balconies,
          property_details.other_rooms,
          property_details.floors
        ];
        const detailsResult = await client.query(detailsQuery, detailsValues);
        const detailsRow = detailsResult.rows[0];
        propertyDetails = {
          property_id: detailsRow.property_id,
          rooms: detailsRow.rooms,
          bathrooms: detailsRow.bathrooms,
          balconies: detailsRow.balconies,
          other_rooms: detailsRow.other_rooms,
          floors: detailsRow.floors
        };
      }

      // Insert parking if provided
      let parkingData: ParkingResponseDto | undefined;
      if (parking) {
        const parkingQuery = `
          INSERT INTO parking (property_id, parking_count, parking_type)
          VALUES ($1, $2, $3)
          RETURNING *
        `;
        const parkingValues = [
          newProperty.id,
          parking.parking_count,
          parking.parking_type
        ];
        const parkingResult = await client.query(parkingQuery, parkingValues);
        const parkingRow = parkingResult.rows[0];
        parkingData = {
          property_id: parkingRow.property_id,
          parking_count: parkingRow.parking_count,
          parking_type: parkingRow.parking_type as ParkingType
        };
      }

      await client.query('COMMIT');

      return {
        id: newProperty.id,
        title: newProperty.title,
        property_for: newProperty.property_for as PropertyFor,
        property_type: newProperty.property_type,
        city: newProperty.city,
        locality: newProperty.locality,
        sub_locality: newProperty.sub_locality,
        apartment: newProperty.apartment,
        availability_status: newProperty.availability_status as AvailabilityStatus,
        property_age: newProperty.property_age,
        ownership: newProperty.ownership as Ownership,
        price_per_sqft: newProperty.price_per_sqft,
        brokerage_charge: newProperty.brokerage_charge,
        description: newProperty.description,
        property_features: newProperty.property_features,
        property_amenities: newProperty.property_amenities,
        created_at: newProperty.created_at,
        updated_at: newProperty.updated_at,
        property_details: propertyDetails,
        parking: parkingData
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw new BadRequestException(`Failed to create property: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async getAllProperties(userId: string): Promise<PropertyResponseDto[]> {
    const query = `
      SELECT 
        p.*,
        pd.rooms, pd.bathrooms, pd.balconies, pd.other_rooms, pd.floors,
        pk.parking_count, pk.parking_type
      FROM properties p
      LEFT JOIN property_details pd ON p.id = pd.property_id
      LEFT JOIN parking pk ON p.id = pk.property_id
      WHERE p.created_by = $1
      ORDER BY p.created_at DESC
    `;

    const result = await dbInstance.query(query, [userId]);
    
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      property_for: row.property_for as PropertyFor,
      property_type: row.property_type,
      city: row.city,
      locality: row.locality,
      sub_locality: row.sub_locality,
      apartment: row.apartment,
      availability_status: row.availability_status as AvailabilityStatus,
      property_age: row.property_age,
      ownership: row.ownership as Ownership,
      price_per_sqft: row.price_per_sqft,
      brokerage_charge: row.brokerage_charge,
      description: row.description,
      property_features: row.property_features,
      property_amenities: row.property_amenities,
      property_size: row.property_size,
      created_at: row.created_at,
      updated_at: row.updated_at,
      property_details: row.rooms || row.bathrooms || row.balconies || row.other_rooms || row.floors ? {
        property_id: row.id,
        rooms: row.rooms,
        bathrooms: row.bathrooms,
        balconies: row.balconies,
        other_rooms: row.other_rooms,
        floors: row.floors
      } : undefined,
      parking: row.parking_count || row.parking_type ? {
        property_id: row.id,
        parking_count: row.parking_count,
        parking_type: row.parking_type as ParkingType
      } : undefined
    }));
  }

  async getPropertyById(id: number): Promise<PropertyResponseDto> {
    const query = `
      SELECT 
        p.*,
        pd.rooms, pd.bathrooms, pd.balconies, pd.other_rooms, pd.floors,
        pk.parking_count, pk.parking_type
      FROM properties p
      LEFT JOIN property_details pd ON p.id = pd.property_id
      LEFT JOIN parking pk ON p.id = pk.property_id
      WHERE p.id = $1
    `;

    const result = await dbInstance.query(query, [id]);
    
    if (result.rows.length === 0) {
      throw new NotFoundException('Property not found');
    }

    const row = result.rows[0];

    return {
      id: row.id,
      title: row.title,
      property_for: row.property_for as PropertyFor,
      property_type: row.property_type,
      city: row.city,
      locality: row.locality,
      sub_locality: row.sub_locality,
      apartment: row.apartment,
      availability_status: row.availability_status as AvailabilityStatus,
      property_age: row.property_age,
      ownership: row.ownership as Ownership,
      price_per_sqft: row.price_per_sqft,
      brokerage_charge: row.brokerage_charge,
      description: row.description,
      property_features: row.property_features,
      property_amenities: row.property_amenities,
      created_at: row.created_at,
      updated_at: row.updated_at,
      property_details: row.rooms || row.bathrooms || row.balconies || row.other_rooms || row.floors ? {
        property_id: row.id,
        rooms: row.rooms,
        bathrooms: row.bathrooms,
        balconies: row.balconies,
        other_rooms: row.other_rooms,
        floors: row.floors
      } : undefined,
      parking: row.parking_count || row.parking_type ? {
        property_id: row.id,
        parking_count: row.parking_count,
        parking_type: row.parking_type as ParkingType
      } : undefined
    };
  }

  async updateProperty(id: number, updatePropertyDto: UpdatePropertyDto): Promise<PropertyResponseDto> {
    const client = await dbInstance.connection();
    
    try {
      await client.query('BEGIN');

      // Check if property exists
      const existingProperty = await this.getPropertyById(id);

      // Extract property details and parking from the DTO
      const { property_details, parking, ...propertyData } = updatePropertyDto;

      // Update main property
      let propertyQuery = 'UPDATE properties SET ';
      const propertyUpdates: string[] = [];
      const propertyValues: any[] = [];
      let paramCount = 1;

      for (const [key, value] of Object.entries(propertyData)) {
        if (value !== undefined) {
          propertyUpdates.push(`${key} = $${paramCount}`);
          propertyValues.push(value);
          paramCount++;
        }
      }

      if (propertyUpdates.length > 0) {
        propertyUpdates.push('updated_at = CURRENT_TIMESTAMP');
        propertyQuery += propertyUpdates.join(', ') + ` WHERE id = $${paramCount} RETURNING *`;
        propertyValues.push(id);

        const propertyResult = await client.query(propertyQuery, propertyValues);
        const updatedProperty = propertyResult.rows[0];

        // Update property details if provided
        let propertyDetails: PropertyDetailsResponseDto | undefined;
        if (property_details) {
          const detailsQuery = `
            INSERT INTO property_details (property_id, rooms, bathrooms, balconies, other_rooms, floors)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (property_id) 
            DO UPDATE SET 
              rooms = EXCLUDED.rooms,
              bathrooms = EXCLUDED.bathrooms,
              balconies = EXCLUDED.balconies,
              other_rooms = EXCLUDED.other_rooms,
              floors = EXCLUDED.floors
            RETURNING *
          `;
          const detailsValues = [
            id,
            property_details.rooms,
            property_details.bathrooms,
            property_details.balconies,
            property_details.other_rooms,
            property_details.floors
          ];
          const detailsResult = await client.query(detailsQuery, detailsValues);
          const detailsRow = detailsResult.rows[0];
          propertyDetails = {
            property_id: detailsRow.property_id,
            rooms: detailsRow.rooms,
            bathrooms: detailsRow.bathrooms,
            balconies: detailsRow.balconies,
            other_rooms: detailsRow.other_rooms,
            floors: detailsRow.floors
          };
        }

        // Update parking if provided
        let parkingData: ParkingResponseDto | undefined;
        if (parking) {
          const parkingQuery = `
            INSERT INTO parking (property_id, parking_count, parking_type)
            VALUES ($1, $2, $3)
            ON CONFLICT (property_id) 
            DO UPDATE SET 
              parking_count = EXCLUDED.parking_count,
              parking_type = EXCLUDED.parking_type
            RETURNING *
          `;
          const parkingValues = [
            id,
            parking.parking_count,
            parking.parking_type
          ];
          const parkingResult = await client.query(parkingQuery, parkingValues);
          const parkingRow = parkingResult.rows[0];
          parkingData = {
            property_id: parkingRow.property_id,
            parking_count: parkingRow.parking_count,
            parking_type: parkingRow.parking_type as ParkingType
          };
        }

        await client.query('COMMIT');

        return {
          id: updatedProperty.id,
          title: updatedProperty.title,
          property_for: updatedProperty.property_for as PropertyFor,
          property_type: updatedProperty.property_type,
          city: updatedProperty.city,
          locality: updatedProperty.locality,
          sub_locality: updatedProperty.sub_locality,
          apartment: updatedProperty.apartment,
          availability_status: updatedProperty.availability_status as AvailabilityStatus,
          property_age: updatedProperty.property_age,
          ownership: updatedProperty.ownership as Ownership,
          price_per_sqft: updatedProperty.price_per_sqft,
          brokerage_charge: updatedProperty.brokerage_charge,
          description: updatedProperty.description,
          property_features: updatedProperty.property_features,
          property_amenities: updatedProperty.property_amenities,
          created_at: updatedProperty.created_at,
          updated_at: updatedProperty.updated_at,
          property_details: propertyDetails || existingProperty.property_details,
          parking: parkingData || existingProperty.parking
        };
      } else {
        // No property fields to update, just return existing property
        await client.query('COMMIT');
        return existingProperty;
      }

    } catch (error) {
      await client.query('ROLLBACK');
      throw new BadRequestException(`Failed to update property: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async deleteProperty(id: number): Promise<void> {
    // Check if property exists
    await this.getPropertyById(id);

    const query = 'DELETE FROM properties WHERE id = $1';
    await dbInstance.query(query, [id]);
  }

  async getPropertiesByCity(city: string): Promise<PropertyResponseDto[]> {
    const query = `
      SELECT 
        p.*,
        pd.rooms, pd.bathrooms, pd.balconies, pd.other_rooms, pd.floors,
        pk.parking_count, pk.parking_type
      FROM properties p
      LEFT JOIN property_details pd ON p.id = pd.property_id
      LEFT JOIN parking pk ON p.id = pk.property_id
      WHERE LOWER(p.city) = LOWER($1)
      ORDER BY p.created_at DESC
    `;

    const result = await dbInstance.query(query, [city]);
    
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      property_for: row.property_for as PropertyFor,
      property_type: row.property_type,
      city: row.city,
      locality: row.locality,
      sub_locality: row.sub_locality,
      apartment: row.apartment,
      availability_status: row.availability_status as AvailabilityStatus,
      property_age: row.property_age,
      ownership: row.ownership as Ownership,
      price_per_sqft: row.price_per_sqft,
      brokerage_charge: row.brokerage_charge,
      description: row.description,
      property_features: row.property_features,
      property_amenities: row.property_amenities,
      created_at: row.created_at,
      updated_at: row.updated_at,
      property_details: row.rooms || row.bathrooms || row.balconies || row.other_rooms || row.floors ? {
        property_id: row.id,
        rooms: row.rooms,
        bathrooms: row.bathrooms,
        balconies: row.balconies,
        other_rooms: row.other_rooms,
        floors: row.floors
      } : undefined,
      parking: row.parking_count || row.parking_type ? {
        property_id: row.id,
        parking_count: row.parking_count,
        parking_type: row.parking_type as ParkingType
      } : undefined
    }));
  }

  async getPropertiesByType(propertyType: string): Promise<PropertyResponseDto[]> {
    const query = `
      SELECT 
        p.*,
        pd.rooms, pd.bathrooms, pd.balconies, pd.other_rooms, pd.floors,
        pk.parking_count, pk.parking_type
      FROM properties p
      LEFT JOIN property_details pd ON p.id = pd.property_id
      LEFT JOIN parking pk ON p.id = pk.property_id
      WHERE LOWER(p.property_type) = LOWER($1)
      ORDER BY p.created_at DESC
    `;

    const result = await dbInstance.query(query, [propertyType]);
    
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      property_for: row.property_for as PropertyFor,
      property_type: row.property_type,
      city: row.city,
      locality: row.locality,
      sub_locality: row.sub_locality,
      apartment: row.apartment,
      availability_status: row.availability_status as AvailabilityStatus,
      property_age: row.property_age,
      ownership: row.ownership as Ownership,
      price_per_sqft: row.price_per_sqft,
      brokerage_charge: row.brokerage_charge,
      description: row.description,
      property_features: row.property_features,
      property_amenities: row.property_amenities,
      created_at: row.created_at,
      updated_at: row.updated_at,
      property_details: row.rooms || row.bathrooms || row.balconies || row.other_rooms || row.floors ? {
        property_id: row.id,
        rooms: row.rooms,
        bathrooms: row.bathrooms,
        balconies: row.balconies,
        other_rooms: row.other_rooms,
        floors: row.floors
      } : undefined,
      parking: row.parking_count || row.parking_type ? {
        property_id: row.id,
        parking_count: row.parking_count,
        parking_type: row.parking_type as ParkingType
      } : undefined
    }));
  }

  async addMedia(
    propertyId: number,
    items: Array<{ media_type: 'image' | 'video'; url: string }>
  ): Promise<void> {
    if (!items.length) return;
    const client = await dbInstance.connection();
    try {
      await client.query('BEGIN');
      for (const item of items) {
        await client.query(
          'INSERT INTO property_media (property_id, media_type, url) VALUES ($1, $2, $3)',
          [propertyId, item.media_type, item.url]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw new BadRequestException('Failed to save media');
    } finally {
      client.release();
    }
  }
}
