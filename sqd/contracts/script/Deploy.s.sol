// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/SimpleLogger.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        SimpleLogger logger = new SimpleLogger();

        console.log("SimpleLogger deployed at:", address(logger));

        vm.stopBroadcast();
    }
}
