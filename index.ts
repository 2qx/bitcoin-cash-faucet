

import { Contract, ElectrumNetworkProvider, FailedTransactionError } from 'cashscript';
import { compileString } from "cashc";
import path from 'path';

import { TransactionDetails } from 'cashscript/dist/module/interfaces';

import { faucetContract } from "./faucet.ts"

// blocks between payouts
let period = 1;

// the faucet payout
let payout = 1000;


export async function getContract(nonce:number): Promise<Contract> {
  

  // Compile the TransferWithTimeout contract
  let script = compileString(faucetContract)

  // Initialise a network provider for network operations on Testnet
  const provider = new ElectrumNetworkProvider('staging');

  let contract =  new Contract(script, [period, payout, nonce], provider);

  console.log('# contract nonce     #', nonce);
  console.log('contract address:     ', contract.address);
  console.log('contract balance:     ', await contract.getBalance());
  return contract

}

export async function drip(address:string, nonce:number): Promise<TransactionDetails> {

  let contract = await getContract(nonce);
  let balance = await contract.getBalance();
  let fn = contract.functions.drip;
  
  let newPrincipal = balance - payout

  let minerFee = 152;
  let sendAmout = payout - minerFee
  console.log("payout:              -", sendAmout )
  console.log("fee paid:            -", minerFee )
  console.log("===================================" )
  console.log("new contract balance: ", newPrincipal)
  try{
    let payTx = await fn()
    .to([
      {
        to: contract.address,
        amount: newPrincipal,
      },
      { 
        to: address,
        amount: sendAmout
      },
    ])
    .withAge(period)
    .withoutChange()
    .send();
    return payTx
  }catch(e){
      if(e===FailedTransactionError) console.log("Faucet has already paid for this period.")
      throw(e)
  }

}



