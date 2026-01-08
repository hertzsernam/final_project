import hardhatPkg from "hardhat";
const { ethers } = hardhatPkg;
import fs from "fs";
import path from "path";

async function main() {
  console.log("Starting deployment...");
  
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  
  console.log(`Deploying to network: ${networkName} (Chain ID: ${network.chainId})`);
  
  // Deploy Governance contract first
  console.log("Deploying Governance...");
  const Governance = await ethers.getContractFactory("Governance");
  const governance = await Governance.deploy();
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("Governance deployed to:", governanceAddress);
  
  // Deploy Bank contract
  console.log("Deploying Bank...");
  const Bank = await ethers.getContractFactory("Bank");
  const bank = await Bank.deploy();
  await bank.waitForDeployment();
  const bankAddress = await bank.getAddress();
  console.log("Bank deployed to:", bankAddress);
  
  // Deploy Mock Bank for testing (optional, only for localhost)
  let bankMockAddress = "";
  if (networkName === "localhost" || networkName === "hardhat") {
    console.log("Deploying BankMock...");
    const BankMock = await ethers.getContractFactory("BankMock");
    const bankMock = await BankMock.deploy();
    await bankMock.waitForDeployment();
    bankMockAddress = await bankMock.getAddress();
    console.log("BankMock deployed to:", bankMockAddress);
  }
  
  // Get contract ABIs
  const governanceArtifact = await ethers.getContractFactory("Governance");
  const bankArtifact = await ethers.getContractFactory("Bank");
  
  // Save deployment info
  const deploymentInfo = {
    timestamp: new Date().toISOString(),
    network: networkName,
    chainId: network.chainId.toString(),
    contracts: {
      governance: {
        address: governanceAddress,
      },
      bank: {
        address: bankAddress,
      },
      ...(bankMockAddress && {
        bankMock: {
          address: bankMockAddress,
        },
      }),
    },
  };
  
  // Ensure contracts directory exists
  const contractsDir = path.join(process.cwd(), "contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(contractsDir, "deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\nDeployment completed successfully!");
  console.log("\nDeployed contracts:");
  console.log("  Governance:", governanceAddress);
  console.log("  Bank:", bankAddress);
  if (bankMockAddress) {
    console.log("  BankMock:", bankMockAddress);
  }
  console.log("\nContract addresses saved to: contracts/deployment.json");
  
  // If deploying to testnet/mainnet, suggest verification
  if (networkName !== "localhost" && networkName !== "hardhat") {
    console.log("\nTo verify contracts on Etherscan, run:");
    console.log(`  npx hardhat verify --network ${networkName} ${governanceAddress}`);
    console.log(`  npx hardhat verify --network ${networkName} ${bankAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

