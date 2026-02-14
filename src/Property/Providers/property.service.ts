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
import { SavePropertiesDto } from '../dto/SaveProperty.dto';

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
           price_per_sqft, brokerage_charge, description, property_features, property_amenities, price, property_size,created_by
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
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
         propertyData.price,
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
         price: newProperty.price,
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

  async getAllPropertiesByUser(userId: string): Promise<PropertyResponseDto[]> {
    const query = `
      SELECT 
        p.*,
        pd.rooms, pd.bathrooms, pd.balconies, pd.other_rooms, pd.floors,
        pk.parking_count, pk.parking_type,
        (SELECT COALESCE(array_agg(pi.url ORDER BY pi.id), ARRAY[]::text[])
           FROM property_images pi WHERE pi.property_id = p.id) AS images,
        (SELECT COALESCE(array_agg(pv.url ORDER BY pv.id), ARRAY[]::text[])
           FROM property_videos pv WHERE pv.property_id = p.id) AS videos,
           CASE 
        WHEN sp.user_id IS NOT NULL THEN true
        ELSE false
    END AS "isSaved"
      FROM properties p
      LEFT JOIN property_details pd ON p.id = pd.property_id
      LEFT JOIN parking pk ON p.id = pk.property_id
      LEFT JOIN pd_saved_properties sp
      ON sp.propertyid = p.id
      AND sp.user_id = $1
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
      price: row.price,
      description: row.description,
      property_features: row.property_features,
      property_amenities: row.property_amenities,
      property_size: row.property_size,
      created_at: row.created_at,
      updated_at: row.updated_at,
      images: row.images || [],
      videos: row.videos || [],
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

  async getMostClickedProperties(limit = 1) {
    // 1) Subquery top_properties computes top N property_ids by clicks
    // 2) Join with properties + property_details + parking and fetch images/videos arrays
    const sql = `
      WITH top_properties AS (
        SELECT property_id::int AS property_id, COUNT(*) AS clicks
        FROM properties_seen_time
        GROUP BY property_id
        ORDER BY clicks DESC
        LIMIT $1
      )
      SELECT
        p.id,
        p.title,
        p.price_per_sqft,
        p.price,
        p.description,
        COALESCE((SELECT array_agg(pi.url ORDER BY pi.id) FROM property_images pi WHERE pi.property_id = p.id), ARRAY[]::text[]) AS images,
        COALESCE((SELECT array_agg(pv.url ORDER BY pv.id) FROM property_videos pv WHERE pv.property_id = p.id), ARRAY[]::text[]) AS videos,
        tp.clicks
      FROM top_properties tp
      JOIN properties p ON p.id = tp.property_id
      LEFT JOIN property_details pd ON p.id = pd.property_id
      LEFT JOIN parking pk ON p.id = pk.property_id
      ORDER BY tp.clicks DESC;
    `;

    const res = await dbInstance.query(sql, [limit]);
    // Map rows into the minimal shape required
    const mapped = res.rows.map((r: any) => ({
      id: r.id,
      name: r.title,
      price: r.price ?? r.price_per_sqft,
      // choose first image URL as `image`, or fallback to null (or emoji)
      image: Array.isArray(r.images) && r.images.length ? r.images[0] : null,
      location: r.location,
      description: r.description,
      // optional debug fields you can remove
      _clicks: Number(r.clicks ?? 0),
    }));

    return mapped;
  }

  async getAllProperties(userId: string): Promise<PropertyResponseDto[]> {
    const query = `
      SELECT 
        p.*,
        pd.rooms, pd.bathrooms, pd.balconies, pd.other_rooms, pd.floors,
        pk.parking_count, pk.parking_type,
        (SELECT COALESCE(array_agg(pi.url ORDER BY pi.id), ARRAY[]::text[])
           FROM property_images pi WHERE pi.property_id = p.id) AS images,
        (SELECT COALESCE(array_agg(pv.url ORDER BY pv.id), ARRAY[]::text[])
           FROM property_videos pv WHERE pv.property_id = p.id) AS videos
      FROM properties p
      LEFT JOIN property_details pd ON p.id = pd.property_id
      LEFT JOIN parking pk ON p.id = pk.property_id
      ORDER BY p.created_at DESC
    `;

    const result = await dbInstance.query(query);
     
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
      price: row.price,
      description: row.description,
      property_features: row.property_features,
      property_amenities: row.property_amenities,
      property_size: row.property_size,
      created_at: row.created_at,
      updated_at: row.updated_at,
      images: row.images || [],
      videos: row.videos || [],
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
        pk.parking_count, pk.parking_type,
        (SELECT COALESCE(array_agg(pi.url ORDER BY pi.id), ARRAY[]::text[])
           FROM property_images pi WHERE pi.property_id = p.id) AS images,
        (SELECT COALESCE(array_agg(pv.url ORDER BY pv.id), ARRAY[]::text[])
           FROM property_videos pv WHERE pv.property_id = p.id) AS videos
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
      price: row.price,
      description: row.description,
      property_features: row.property_features,
      property_amenities: row.property_amenities,
      created_at: row.created_at,
      updated_at: row.updated_at,
      images: row.images || [],
      videos: row.videos || [],
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
          price: updatedProperty.price,
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
        pk.parking_count, pk.parking_type,
        (SELECT COALESCE(array_agg(pi.url ORDER BY pi.id), ARRAY[]::text[])
           FROM property_images pi WHERE pi.property_id = p.id) AS images,
        (SELECT COALESCE(array_agg(pv.url ORDER BY pv.id), ARRAY[]::text[])
           FROM property_videos pv WHERE pv.property_id = p.id) AS videos
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
      price: row.price,
      description: row.description,
      property_features: row.property_features,
      property_amenities: row.property_amenities,
      created_at: row.created_at,
      updated_at: row.updated_at,
      images: row.images || [],
      videos: row.videos || [],
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
        pk.parking_count, pk.parking_type,
        (SELECT COALESCE(array_agg(pi.url ORDER BY pi.id), ARRAY[]::text[])
           FROM property_images pi WHERE pi.property_id = p.id) AS images,
        (SELECT COALESCE(array_agg(pv.url ORDER BY pv.id), ARRAY[]::text[])
           FROM property_videos pv WHERE pv.property_id = p.id) AS videos
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
      price: row.price,
      description: row.description,
      property_features: row.property_features,
      property_amenities: row.property_amenities,
      created_at: row.created_at,
      updated_at: row.updated_at,
      images: row.images || [],
      videos: row.videos || [],
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
        // Backward-compatible insert into legacy aggregated table
        await client.query(
          'INSERT INTO property_media (property_id, media_type, url) VALUES ($1, $2, $3)',
          [propertyId, item.media_type, item.url]
        );

        // New: split storage into dedicated tables
        if (item.media_type === 'image') {
          await client.query(
            'INSERT INTO property_images (property_id, url) VALUES ($1, $2)',
            [propertyId, item.url]
          );
        } else if (item.media_type === 'video') {
          await client.query(
            'INSERT INTO property_videos (property_id, url) VALUES ($1, $2)',
            [propertyId, item.url]
          );
        }
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw new BadRequestException('Failed to save media');
    } finally {
      client.release();
    }
  }

   async saveProperties(userId: number, propertyId: number): Promise<void> {

        const dbValues = [
            userId,
            propertyId
        ];

        // check if property already saved;
        const fetchQuery = `SELECT * from pd_save_properties WHERE userid = $1 and propertyid = $2;`

        const checkResponse = await dbInstance.query(fetchQuery,dbValues);

        if (checkResponse.rowCount) {
          throw new Error(`Property already saved by the user.`);
        }


        const insertQuery: string = `INSERT INTO pd_save_properties (
    userid,
    propertyid
    ) VALUES ($1,$2) RETURNING *;`

        const response = await dbInstance.query(insertQuery, dbValues);

        if (!response.rowCount) {
            throw new Error(`Unable to save the property.`);
        }

    }

    async getSavedProperties(userId: number): Promise<SavePropertiesDto[]> {

        const saveProperties : SavePropertiesDto[] = [];

        const fetchQuery : string = `SELECT * from pd_save_properties where userid = $1;`;

        const fetchValues = [
            userId
        ]

        const response = await dbInstance.query(fetchQuery,fetchValues);

        const rows = response.rows;

        rows.forEach((row : any) => {

            const saveProperty : SavePropertiesDto = {
                userId : row.userid,
                propertyId : row.propertyid
            }

            saveProperties.push(saveProperty)
        })

        return saveProperties;
    }
}
