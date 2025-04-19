// scripts/post-deploy.ts - Script to copy ABIs and addresses to frontend
import fs from 'fs';
import path from 'path';

interface ContractInfo {
  address: string;
  abi: any;
}

interface ContractConfig {
  [contractName: string]: ContractInfo;
}

async function main() {
  console.log("Starting post-deployment configuration...");
  
  // Define paths
  const artifactsDir = path.join(__dirname, '../artifacts/contracts');
  const frontendConfigPath = path.join(__dirname, '../frontend/src/config');
  const frontendAbiPath = path.join(__dirname, '../frontend/src/abis');
  
  // Ensure the destination directories exist
  fs.mkdirSync(frontendConfigPath, { recursive: true });
  fs.mkdirSync(frontendAbiPath, { recursive: true });

  // Read deployment addresses from deployment output file
  // This assumes your deploy.ts script writes the addresses to this file
  const deploymentData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployment-addresses.json'), 'utf8')
  );

  const config: ContractConfig = {};

  // Process each contract
  for (const [contractName, address] of Object.entries(deploymentData)) {
    console.log(`Processing ${contractName}...`);
    
    // Find the contract artifact
    const artifactPath = findArtifactPath(artifactsDir, `${contractName}.json`);
    
    if (artifactPath) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      
      // Add to config
      config[contractName] = {
        address: address as string,
        abi: artifact.abi
      };
      
      // Copy ABI to separate file
      fs.writeFileSync(
        path.join(frontendAbiPath, `${contractName}.json`),
        JSON.stringify(artifact.abi, null, 2)
      );
      
      console.log(`Saved ABI for ${contractName}`);
    } else {
      console.error(`Could not find artifact for ${contractName}`);
    }
  }
  
  // Write the full configuration file with addresses and references to ABIs
  fs.writeFileSync(
    path.join(frontendConfigPath, 'contracts.js'),
    `// Auto-generated from deployment on ${new Date().toISOString()}
export const contracts = ${JSON.stringify(config, null, 2)};
`
  );
  
  // Create a simplified config with just the addresses
  const addressesOnly = Object.entries(config).reduce((acc, [name, info]) => {
    acc[name] = info.address;
    return acc;
  }, {} as Record<string, string>);
  
  fs.writeFileSync(
    path.join(frontendConfigPath, 'addresses.js'),
    `// Auto-generated from deployment on ${new Date().toISOString()}
export const contractAddresses = ${JSON.stringify(addressesOnly, null, 2)};
`
  );

  // Create JavaScript imports for ABIs in frontend
  fs.writeFileSync(
    path.join(frontendAbiPath, 'index.js'),
    `// Auto-generated from deployment on ${new Date().toISOString()}
${Object.keys(config).map(name => `import ${name}ABI from './${name}.json';`).join('\n')}

export const abis = {
${Object.keys(config).map(name => `  ${name}: ${name}ABI,`).join('\n')}
};
`
  );
  
  console.log("Post-deployment configuration completed!");
  console.log(`Config files written to: ${frontendConfigPath}`);
  console.log(`ABI files written to: ${frontendAbiPath}`);
}

/**
 * Recursively find a file by name in a directory
 */
function findArtifactPath(dir: string, fileName: string): string | null {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      const foundPath = findArtifactPath(filePath, fileName);
      if (foundPath) return foundPath;
    } else if (file === fileName) {
      return filePath;
    }
  }
  
  return null;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });