import React, { Component } from "react";
import DS from "./contracts/Diamstore.json";
import Diam from "./contracts/Diam.json";
import "./App.css";
import { ethers } from "ethers";

class App extends Component {
  state = { tokenC: null, storageValue: null, userToContract: null, balance: null, tokens: null, web3: null, signer: null, accounts: null, contract: null, chainId: null, network: null, allowance: 0 };

  componentDidMount = async () => {
    try {

      const web3 = new ethers.providers.Web3Provider(window.ethereum)

      await web3.send("eth_requestAccounts", []);

      const signer = web3.getSigner();
      console.log("Account:", await signer.getAddress());

      const accounts = await signer.getAddress()

      const instance = new ethers.Contract("0x8b861cE2e292B42e9f98345d3A17E14a4303A21E", Diam.abi, web3);

      const instance2 = new ethers.Contract("0xFE51787b5Eeb8467e36C430C33a2dE1399926A25", DS, web3);

      const _chainId = await web3.getNetwork()

      // console.log(_chainId)

      this.setState({ chainId: _chainId.chainId })
      this.setState({ network: _chainId.name })

      const bal = await instance2.balanceOf(accounts)//await instance.balanceOf(accounts)

      console.log("balance", bal.toString())

      // console.log("balance ss", await instance2.balanceOf(accounts))

      const _bal = ethers.utils.formatEther(bal.toString())

      console.log("balance", _bal)

      const response = await instance2.userTokens(accounts);
      console.log("res ", response)
      console.log("etherformat res", ethers.utils.formatEther(response.toString()));

      this.setState({ storageValue: ethers.utils.formatEther(response.toString()) });




      this.setState({ tokenC: instance, balance: _bal, web3, signer, accounts, contract: instance2 });
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };


  name = async () => {
    const { accounts, contract } = this.state;

    const response = await contract.name();
    console.log("res ", response)

    this.setState({ storageValue: response });
  };

  getAllowance = async () => {
    const { accounts, contract } = this.state;
    console.log(accounts)
    const response = await contract.allowance(accounts.toString(), "0xFE51787b5Eeb8467e36C430C33a2dE1399926A25");
    console.log("etherformat", ethers.utils.formatEther(response.toString()));
    this.setState({ allowance: ethers.utils.formatEther(response.toString()) });
    // console.log("res ", response.toString())
    // this.setState({ allowance: response.toString() });
  };

  signData = async () => {

    const { web3, signer, accounts, contract, tokenC } = this.state;

    console.log("signer is", await signer.getAddress())

    var milsec_deadline = Date.now() / 1000 + 100;

    console.log(milsec_deadline, "milisec");

    var deadline = parseInt(String(milsec_deadline).slice(0, 10));

    console.log(deadline, "sec");

    var _nun = await tokenC.nonces(accounts.toString())

    var nun = _nun.toString()

    console.log("nounce ", nun)

    const _chainId = await web3.getNetwork()

    console.log("netId", _chainId.chainId);


    console.log("started ", await signer.getAddress())

    const sig = await signer._signTypedData(
      {
        name: "Diam", version: "1", chainId: _chainId.chainId, verifyingContract: "0x8b861cE2e292B42e9f98345d3A17E14a4303A21E"
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
        owner: await signer.getAddress(),
        spender: "0xFE51787b5Eeb8467e36C430C33a2dE1399926A25",
        value: "20000000000000000000",
        nonce: nun,
        deadline: deadline
      }
    )

    console.log(sig)

    const { v, r, s } = ethers.utils.splitSignature(sig)


    console.log(v, " ", r, " ", s)

    //contract.permit(await signer.getAddress(), "0xf796CBb51DcCdABfe3d7f7B3aA05db9eC89E8E28", "200000000000000000000", deadline, v, r, s,)


    const ContractSigner = contract.connect(signer);

    // Each DAI has 18 decimal places
    // const dai = ethers.utils.parseUnits("1.0", 18);

    // Send 1 DAI to "ricmoo.firefly.eth"
    let tx = ContractSigner.depositWithPermit("20000000000000000000", deadline, v, r, s,);
    console.log(await tx)



  }


  buyTokens = async (event) => {

    event.preventDefault();
    const { accounts, contract } = this.state;

    let _web3 = new ethers.providers.JsonRpcBatchProvider("https://ropsten.infura.io/v3/0186bbd47475436b9e3ff3d644b4d21c")

    let signer = new ethers.Wallet("238c0cd652acdd2145b3ee0a401c9f208b448d9ca27c0190cc0d93e4b5337764", _web3);

    console.log("Sending tokens from " + (await signer.getAddress()).toString() + " to " + accounts.toString())

    const contractWithSigner = contract.connect(signer);


    let wei = ethers.utils.parseEther("100");

    console.log("in wei", wei.toString())

    let tx = await contractWithSigner.transfer(accounts, wei.toString());

    console.log(tx.hash)

    alert("Wait for transaction to confirm")

  }


  handleChange = async (event) => {
    if (event.target.value > 101) {
      alert("tokens exceed 100")
      return
    }
    this.setState({ tokens: event.target.value });
  }



  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div >
          <h2>EIP 712 Example using ethers.js</h2>
        </div>


        <div>connected wallet: {this.state.accounts}</div>
        <br></br>
        <div>connected wallet balance: {this.state.balance}</div>
        <br></br>
        <div>chainId : {this.state.chainId}  Network: {this.state.network}</div>

        <hr></hr>

        <h2>You can get 100 tokens by clicking below button</h2>

        {/* <div>Allowance you have given to 0xFE51787b5Eeb8467e36C430C33a2dE1399926A25: {this.state.allowance}</div> */}

        <br></br>

        <form onSubmit={this.buyTokens}>

          <input type="submit" value="Get me some Tokens" />
          {/* <p>you will get 100 tokens for testing it out !</p> */}
        </form>

        {/* <button onClick={() => this.buyTokens()}> get tokens </button> */}

        <br></br>

        {/* <button onClick={() => this.getAllowance()}> Get allowance you gave to 0xFE51787b5Eeb8467e36C430C33a2dE1399926A25</button> */}
<h2>Now Try to send 20 tokens to the smart contract (0xFE51787b5Eeb8467e36C430C33a2dE1399926A25) in a single transaction</h2>

        <button onClick={() => this.signData()}> Send 20 tokens to the Smart contract  </button>

        <p>Token sent to contract by the you so far {this.state.storageValue}</p>
      </div>
    );
  }
}

export default App;
