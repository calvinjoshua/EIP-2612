import React, { Component } from "react";
import Diam from "./contracts/Diam.json";
import getWeb3 from "./getWeb3";
import "./App.css";
import { ethers } from "ethers";
// var ethUtil = require('ethereumjs-util');
// var sigUtil = require('eth-sig-util');


class App extends Component {
  state = { allowance: 0, storageValue: "", web3: null, signer: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {

      const web3 = new ethers.providers.Web3Provider(window.ethereum)

      await web3.send("eth_requestAccounts", []);

      const signer = web3.getSigner();
      console.log("Account:", await signer.getAddress());

      const accounts = await signer.getAddress()

      const instance = new ethers.Contract("0x1e4ec7669CAD6CB8Cc5FDD7233Ef559112a015D2", Diam.abi, web3);

      this.setState({ web3, signer, accounts, contract: instance });
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };


  name = async () => {
    const { accounts, contract } = this.state;
    // Get the value from the contract to prove it worked.
    const response = await contract.name();
    console.log("res ", response)
    // Update state with the result.
    this.setState({ storageValue: response });
  };

  getAllowance = async () => {
    const { accounts, contract } = this.state;
    console.log(accounts)
    // Get the value from the contract to prove it worked.
    const response = await contract.allowance(accounts.toString(), "0xf796CBb51DcCdABfe3d7f7B3aA05db9eC89E8E28");
    console.log("res ", response.toString())
    // Update state with the result.
    this.setState({ allowance: response.toString() });
  };

  signData = async () => {

    const { web3, signer, accounts, contract } = this.state;

    console.log("signer", await signer.getAddress())

    var milsec_deadline = Date.now() / 1000 + 100;

    console.log(milsec_deadline, "milisec");

    var deadline = parseInt(String(milsec_deadline).slice(0, 10));

    console.log(deadline, "sec");

    var _nun = await contract.nonces(accounts.toString())

    var nun = _nun.toString()

    console.log("nounce ", nun)

    const _chainId = await web3.getNetwork()

    console.log("netId", _chainId.chainId);


    console.log("started")

    const sig = await signer._signTypedData(
      {
        name: "Diam", version: "1", chainId: _chainId, verifyingContract: "0x1e4ec7669CAD6CB8Cc5FDD7233Ef559112a015D2"
      },
      {
        Permit: [
          {
            name: "owner",
            type: "address",
          },
          {
            name: "spender",
            type: "address",
          },
          {
            name: "value",
            type: "uint256",
          },
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "deadline",
            type: "uint256",
          },
        ],
      },
      {
        owner: signer,
        spender: "0xf796CBb51DcCdABfe3d7f7B3aA05db9eC89E8E28",
        value: 10000000000,
        nonce: nun,
        deadline: deadline
      }
    )

    console.log(sig)

    const { v, r, s } = ethers.utils.splitSignature(sig)


    await contract.methods.permit(signer, "0xf796CBb51DcCdABfe3d7f7B3aA05db9eC89E8E28", 10000000000, deadline, v, r, s,).send({ from: accounts[0] });
  }



  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h2>EIP 712 Example</h2>

        <div>connected wallet: {this.state.accounts}</div>

        <hr></hr>

        <div>Allowance of {this.state.accounts} to 0xf796CBb51DcCdABfe3d7f7B3aA05db9eC89E8E28: {this.state.allowance}</div>

        <br></br>

        <button onClick={() => this.name()}> get name </button>
        <br></br>
        <button onClick={() => this.getAllowance()}> get allowance of owner to 0xf796CBb51DcCdABfe3d7f7B3aA05db9eC89E8E28</button>
        <br></br>
        <div>The contract name is: {this.state.storageValue}</div>
        <br></br>
        <button onClick={() => this.signData()}> Press to permit 0xf796CBb51DcCdABfe3d7f7B3aA05db9eC89E8E28  </button>
      </div>
    );
  }
}

export default App;
