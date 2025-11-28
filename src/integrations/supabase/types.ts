export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agreements: {
        Row: {
          created_at: string | null
          id: string
          landlord_confirmed: boolean | null
          landlord_id: string
          lease_term_months: number | null
          move_in_date: string | null
          property_id: string
          rent_amount: number
          status: string | null
          tenant_confirmed: boolean | null
          tenant_group_id: string | null
          tenant_user_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          landlord_confirmed?: boolean | null
          landlord_id: string
          lease_term_months?: number | null
          move_in_date?: string | null
          property_id: string
          rent_amount: number
          status?: string | null
          tenant_confirmed?: boolean | null
          tenant_group_id?: string | null
          tenant_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          landlord_confirmed?: boolean | null
          landlord_id?: string
          lease_term_months?: number | null
          move_in_date?: string | null
          property_id?: string
          rent_amount?: number
          status?: string | null
          tenant_confirmed?: boolean | null
          tenant_group_id?: string | null
          tenant_user_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agreements_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreements_tenant_group_id_fkey"
            columns: ["tenant_group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          message: string | null
          property_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          message?: string | null
          property_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          message?: string | null
          property_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          city_name: string
          created_at: string | null
          id: string
          lat: number | null
          lng: number | null
          state_id: string
        }
        Insert: {
          city_name: string
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          state_id: string
        }
        Update: {
          city_name?: string
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          state_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      compatibility_scores: {
        Row: {
          budget_score: number | null
          calculated_at: string | null
          id: string
          lifestyle_score: number | null
          overall_score: number | null
          schedule_score: number | null
          social_score: number | null
          user_id_1: string | null
          user_id_2: string | null
        }
        Insert: {
          budget_score?: number | null
          calculated_at?: string | null
          id?: string
          lifestyle_score?: number | null
          overall_score?: number | null
          schedule_score?: number | null
          social_score?: number | null
          user_id_1?: string | null
          user_id_2?: string | null
        }
        Update: {
          budget_score?: number | null
          calculated_at?: string | null
          id?: string
          lifestyle_score?: number | null
          overall_score?: number | null
          schedule_score?: number | null
          social_score?: number | null
          user_id_1?: string | null
          user_id_2?: string | null
        }
        Relationships: []
      }
      external_listings: {
        Row: {
          bedrooms: number | null
          cached_at: string | null
          city: string | null
          data: Json
          expires_at: string | null
          external_id: string
          id: string
          rent_amount: number | null
          source: string
        }
        Insert: {
          bedrooms?: number | null
          cached_at?: string | null
          city?: string | null
          data: Json
          expires_at?: string | null
          external_id: string
          id?: string
          rent_amount?: number | null
          source: string
        }
        Update: {
          bedrooms?: number | null
          cached_at?: string | null
          city?: string | null
          data?: Json
          expires_at?: string | null
          external_id?: string
          id?: string
          rent_amount?: number | null
          source?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          external_listing_id: string | null
          id: string
          property_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          external_listing_id?: string | null
          id?: string
          property_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          external_listing_id?: string | null
          id?: string
          property_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_external_listing_id_fkey"
            columns: ["external_listing_id"]
            isOneToOne: false
            referencedRelation: "external_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      group_listings: {
        Row: {
          added_by_user_id: string
          created_at: string | null
          group_id: string
          id: string
          note: string | null
          property_id: string
        }
        Insert: {
          added_by_user_id: string
          created_at?: string | null
          group_id: string
          id?: string
          note?: string | null
          property_id: string
        }
        Update: {
          added_by_user_id?: string
          created_at?: string | null
          group_id?: string
          id?: string
          note?: string | null
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_listings_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_listings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string | null
          id: string
          joined_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          group_id?: string | null
          id?: string
          joined_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          group_id?: string | null
          id?: string
          joined_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          combined_budget_max: number | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          id: string
          is_complete: boolean | null
          name: string
          preferred_cities: string[] | null
          preferred_city: string | null
          preferred_state: string | null
          target_move_in_date: string | null
          updated_at: string | null
        }
        Insert: {
          combined_budget_max?: number | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          is_complete?: boolean | null
          name: string
          preferred_cities?: string[] | null
          preferred_city?: string | null
          preferred_state?: string | null
          target_move_in_date?: string | null
          updated_at?: string | null
        }
        Update: {
          combined_budget_max?: number | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          is_complete?: boolean | null
          name?: string
          preferred_cities?: string[] | null
          preferred_city?: string | null
          preferred_state?: string | null
          target_move_in_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      id_verifications: {
        Row: {
          created_at: string | null
          id: string
          id_back_path: string
          id_front_path: string
          review_notes: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          id_back_path: string
          id_front_path: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          id_back_path?: string
          id_front_path?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      income_verifications: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          document_urls: string[] | null
          id: string
          source: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          verified_monthly_income: number | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          document_urls?: string[] | null
          id?: string
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          verified_monthly_income?: number | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          document_urls?: string[] | null
          id?: string
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          verified_monthly_income?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          group_id: string | null
          id: string
          is_read: boolean | null
          recipient_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          group_id?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          group_id?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          background_check_status: string | null
          bio: string | null
          budget_max: number | null
          budget_min: number | null
          cleanliness_level: number | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          full_name: string | null
          guest_frequency: string | null
          id: string
          id_verification_status: string | null
          id_verified: boolean | null
          income_verified: boolean | null
          income_verified_source: string | null
          is_active: boolean | null
          is_public_profile: boolean | null
          landlord_subscription_active: boolean | null
          landlord_verified: boolean | null
          lease_duration_months: number | null
          move_in_date: string | null
          noise_tolerance: number | null
          occupation: string | null
          pets: string | null
          phone: string | null
          phone_verified: boolean | null
          preferred_cities: string[] | null
          preferred_state: string | null
          profile_photo_url: string | null
          role: string | null
          self_reported_monthly_income: number | null
          sleep_schedule: string | null
          smoking: string | null
          social_preference: string | null
          subscription_start: string | null
          subscription_status: string | null
          tenant_subscription_active: boolean | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
          work_from_home: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          background_check_status?: string | null
          bio?: string | null
          budget_max?: number | null
          budget_min?: number | null
          cleanliness_level?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          guest_frequency?: string | null
          id: string
          id_verification_status?: string | null
          id_verified?: boolean | null
          income_verified?: boolean | null
          income_verified_source?: string | null
          is_active?: boolean | null
          is_public_profile?: boolean | null
          landlord_subscription_active?: boolean | null
          landlord_verified?: boolean | null
          lease_duration_months?: number | null
          move_in_date?: string | null
          noise_tolerance?: number | null
          occupation?: string | null
          pets?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          preferred_cities?: string[] | null
          preferred_state?: string | null
          profile_photo_url?: string | null
          role?: string | null
          self_reported_monthly_income?: number | null
          sleep_schedule?: string | null
          smoking?: string | null
          social_preference?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          tenant_subscription_active?: boolean | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          work_from_home?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          background_check_status?: string | null
          bio?: string | null
          budget_max?: number | null
          budget_min?: number | null
          cleanliness_level?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          guest_frequency?: string | null
          id?: string
          id_verification_status?: string | null
          id_verified?: boolean | null
          income_verified?: boolean | null
          income_verified_source?: string | null
          is_active?: boolean | null
          is_public_profile?: boolean | null
          landlord_subscription_active?: boolean | null
          landlord_verified?: boolean | null
          lease_duration_months?: number | null
          move_in_date?: string | null
          noise_tolerance?: number | null
          occupation?: string | null
          pets?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          preferred_cities?: string[] | null
          preferred_state?: string | null
          profile_photo_url?: string | null
          role?: string | null
          self_reported_monthly_income?: number | null
          sleep_schedule?: string | null
          smoking?: string | null
          social_preference?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          tenant_subscription_active?: boolean | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          work_from_home?: boolean | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          amenities: string[] | null
          available_from: string | null
          available_rooms: number
          bedrooms: number | null
          city: string
          country: string | null
          created_at: string | null
          description: string | null
          external_listing_url: string | null
          furnished: boolean | null
          id: string
          is_active: boolean | null
          landlord_id: string | null
          lat: number | null
          lease_duration_months: number | null
          lease_term_months_max: number | null
          lease_term_months_min: number | null
          listing_source: string | null
          listing_type: string | null
          lng: number | null
          max_occupants: number | null
          min_household_income: number | null
          min_household_income_monthly: number | null
          minimum_income_multiplier: number | null
          neighborhood: string | null
          parking: string | null
          pets_allowed: boolean | null
          photos: string[] | null
          postal_code: string | null
          property_type: string | null
          public_code: string | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          rent_amount: number
          rent_total: number | null
          security_deposit: number | null
          smoking_allowed: boolean | null
          square_feet: number | null
          state: string | null
          status: string | null
          street_address: string | null
          title: string
          total_bathrooms: number | null
          total_bedrooms: number
          updated_at: string | null
          use_platform_payments: boolean | null
          utilities_included: boolean | null
          views_count: number | null
          zip_code: string | null
        }
        Insert: {
          address: string
          amenities?: string[] | null
          available_from?: string | null
          available_rooms: number
          bedrooms?: number | null
          city: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          external_listing_url?: string | null
          furnished?: boolean | null
          id?: string
          is_active?: boolean | null
          landlord_id?: string | null
          lat?: number | null
          lease_duration_months?: number | null
          lease_term_months_max?: number | null
          lease_term_months_min?: number | null
          listing_source?: string | null
          listing_type?: string | null
          lng?: number | null
          max_occupants?: number | null
          min_household_income?: number | null
          min_household_income_monthly?: number | null
          minimum_income_multiplier?: number | null
          neighborhood?: string | null
          parking?: string | null
          pets_allowed?: boolean | null
          photos?: string[] | null
          postal_code?: string | null
          property_type?: string | null
          public_code?: string | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          rent_amount: number
          rent_total?: number | null
          security_deposit?: number | null
          smoking_allowed?: boolean | null
          square_feet?: number | null
          state?: string | null
          status?: string | null
          street_address?: string | null
          title: string
          total_bathrooms?: number | null
          total_bedrooms: number
          updated_at?: string | null
          use_platform_payments?: boolean | null
          utilities_included?: boolean | null
          views_count?: number | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          amenities?: string[] | null
          available_from?: string | null
          available_rooms?: number
          bedrooms?: number | null
          city?: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          external_listing_url?: string | null
          furnished?: boolean | null
          id?: string
          is_active?: boolean | null
          landlord_id?: string | null
          lat?: number | null
          lease_duration_months?: number | null
          lease_term_months_max?: number | null
          lease_term_months_min?: number | null
          listing_source?: string | null
          listing_type?: string | null
          lng?: number | null
          max_occupants?: number | null
          min_household_income?: number | null
          min_household_income_monthly?: number | null
          minimum_income_multiplier?: number | null
          neighborhood?: string | null
          parking?: string | null
          pets_allowed?: boolean | null
          photos?: string[] | null
          postal_code?: string | null
          property_type?: string | null
          public_code?: string | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          rent_amount?: number
          rent_total?: number | null
          security_deposit?: number | null
          smoking_allowed?: boolean | null
          square_feet?: number | null
          state?: string | null
          status?: string | null
          street_address?: string | null
          title?: string
          total_bathrooms?: number | null
          total_bedrooms?: number
          updated_at?: string | null
          use_platform_payments?: boolean | null
          utilities_included?: boolean | null
          views_count?: number | null
          zip_code?: string | null
        }
        Relationships: []
      }
      property_inquiries: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          message: string
          property_id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          message: string
          property_id: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          message?: string
          property_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_inquiries_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_photos: {
        Row: {
          created_at: string | null
          id: string
          position: number | null
          property_id: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          position?: number | null
          property_id: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          position?: number | null
          property_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_photos_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_listings: {
        Row: {
          created_at: string | null
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_listings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      states: {
        Row: {
          country: string
          created_at: string | null
          id: string
          state_code: string
          state_name: string
        }
        Insert: {
          country: string
          created_at?: string | null
          id?: string
          state_code: string
          state_name: string
        }
        Update: {
          country?: string
          created_at?: string | null
          id?: string
          state_code?: string
          state_name?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_type: string
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_type: string
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_type?: string
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verifications: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          document_urls: string[] | null
          id: string
          status: string | null
          updated_at: string | null
          user_id: string
          verification_type: string
          verified_data: Json | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          document_urls?: string[] | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          verification_type: string
          verified_data?: Json | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          document_urls?: string[] | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          verification_type?: string
          verified_data?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          background_check_status: string | null
          bio: string | null
          budget_max: number | null
          budget_min: number | null
          cleanliness_level: number | null
          created_at: string | null
          full_name: string | null
          guest_frequency: string | null
          id: string | null
          id_verified: boolean | null
          income_verified: boolean | null
          is_public_profile: boolean | null
          lease_duration_months: number | null
          move_in_date: string | null
          noise_tolerance: number | null
          occupation: string | null
          pets: string | null
          preferred_cities: string[] | null
          profile_photo_url: string | null
          sleep_schedule: string | null
          smoking: string | null
          social_preference: string | null
          work_from_home: boolean | null
        }
        Insert: {
          age?: never
          avatar_url?: string | null
          background_check_status?: string | null
          bio?: string | null
          budget_max?: number | null
          budget_min?: number | null
          cleanliness_level?: number | null
          created_at?: string | null
          full_name?: string | null
          guest_frequency?: string | null
          id?: string | null
          id_verified?: boolean | null
          income_verified?: boolean | null
          is_public_profile?: boolean | null
          lease_duration_months?: number | null
          move_in_date?: string | null
          noise_tolerance?: number | null
          occupation?: string | null
          pets?: string | null
          preferred_cities?: string[] | null
          profile_photo_url?: string | null
          sleep_schedule?: string | null
          smoking?: string | null
          social_preference?: string | null
          work_from_home?: boolean | null
        }
        Update: {
          age?: never
          avatar_url?: string | null
          background_check_status?: string | null
          bio?: string | null
          budget_max?: number | null
          budget_min?: number | null
          cleanliness_level?: number | null
          created_at?: string | null
          full_name?: string | null
          guest_frequency?: string | null
          id?: string | null
          id_verified?: boolean | null
          income_verified?: boolean | null
          is_public_profile?: boolean | null
          lease_duration_months?: number | null
          move_in_date?: string | null
          noise_tolerance?: number | null
          occupation?: string | null
          pets?: string | null
          preferred_cities?: string[] | null
          profile_photo_url?: string | null
          sleep_schedule?: string | null
          smoking?: string | null
          social_preference?: string | null
          work_from_home?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_property_code: { Args: { state_abbr: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "renter" | "landlord" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["renter", "landlord", "admin"],
    },
  },
} as const
