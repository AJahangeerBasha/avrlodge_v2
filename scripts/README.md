# AVR Lodge v2 - Scripts Directory

This directory contains utility scripts for database management and documentation generation.

## Available Scripts

### Database Schema Generation
- **File**: `generateDatabaseSchema.js`
- **Purpose**: Generate comprehensive database schema documentation from Firebase collections
- **Usage**: `npm run generate-schema` or `npm run update-schema`
- **Output**: `DATABASE_SCHEMA.md` in project root

### Data Import Scripts
- **Room Types**: `npm run import-room-types`
- **Rooms**: `npm run import-rooms`
- **Special Charges**: `npm run import-special-charges`
- **Add Rooms**: `npm run add-rooms`

### Data Management
- **Delete Reservation**: `npm run delete-reservation`

## Schema Generator Features

The `generateDatabaseSchema.js` script provides:

- ✅ **Complete Collection Coverage** - All 14 Firebase collections
- ✅ **JavaScript Object Examples** - Real-world data samples
- ✅ **Relationship Mapping** - Cross-collection references
- ✅ **Business Rules** - Validation constraints and limits
- ✅ **Enum Definitions** - All possible status values
- ✅ **Auto-Generated Timestamps** - Shows when schema was last updated
- ✅ **Consistent Format** - Standardized documentation structure

## Output Example

```bash
npm run generate-schema

🚀 Generating AVR Lodge v2 Database Schema...

✅ Database schema generated successfully!
📄 File: DATABASE_SCHEMA.md
📊 Collections: 14
📝 Size: 14.01KB
🕐 Generated: 21/9/2025, 10:35:36 pm
```

## Maintenance

- Run `npm run update-schema` whenever database structure changes
- Keep the schema documentation in sync with TypeScript types
- Update business rules in the script when constraints change

## Dependencies

- **Node.js** - Required for script execution
- **Firebase Types** - TypeScript definitions in `src/lib/types/`
- **Package.json Scripts** - npm commands for easy execution