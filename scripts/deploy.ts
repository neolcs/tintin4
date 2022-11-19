import { ethers } from "hardhat";

async function main() {
  const ContractFactory = await ethers.getContractFactory("RocketToken");

  // uint lockTime_, uint256 freeAmount_, uint256 minPrice_
  const lockTime = Math.floor(Date.now()/1000) + 10*24*60*60;
  const freeAmount = 10;
  const minPrice = 1000;

  const instance = await ContractFactory.deploy(lockTime, freeAmount, minPrice);
  await instance.deployed();

  console.log(`Contract deployed to ${instance.address}`);

  if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
    console.log('Waiting for block confirmations...')
    await instance.deployTransaction.wait(6)
    await verify(instance.address, [])
  }
}

const verify = async (address, args) => {
  console.log("Verify contract...");

  try {
    await run("verify:verify", {
      address,
      constructorArguments: args
    });
  } catch (e) {
    if (e.message.toLowerCase().includes('already verified')) {
      console.log("Already Verified")
    } else {
      console.log(e)
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
