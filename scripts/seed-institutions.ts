import fs from 'fs';
import path from 'path';
import { createInstitution, getAllInstitutions } from '../server/db';

async function seedInstitutions() {
  try {
    // Check if institutions already exist
    const existing = await getAllInstitutions();
    if (existing.length > 0) {
      console.log(`Found ${existing.length} existing institutions. Skipping seed.`);
      return;
    }

    // Read institutions file
    const filePath = path.join(process.cwd(), 'instituciones_final.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const institutions = JSON.parse(fileContent);

    console.log(`Loading ${institutions.length} institutions...`);

    // Insert institutions
    for (const inst of institutions) {
      await createInstitution({
        canonical: inst.canonical,
        country: inst.country,
        countryCode: inst.countryCode,
        orcidRegistryName: inst.orcidRegistryName,
        variants: JSON.stringify(inst.variants),
      });
    }

    console.log(`Successfully loaded ${institutions.length} institutions!`);
  } catch (error) {
    console.error('Error seeding institutions:', error);
    process.exit(1);
  }
}

seedInstitutions();
