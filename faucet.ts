export const faucetContract = `pragma cashscript >= 0.7.0;

// v20220609

// This is an experimental faucet contract 
// Prelim testing on regtest, just a concept
contract Faucet(

    // interval for payouts, in blocks
    int period,

    // amount to be paid by faucet allowance. 
    int payout,

    // random number input into contract to have more than one
    int index
) {
    function drip() {

        // Check that time has passed and that time locks are enabled
        require(tx.age >= period);
            
        // use the index
        require(index >= 0);

        // require the first output to match the active bytecode
        require(tx.outputs[0].lockingBytecode == new LockingBytecodeP2SH(hash160(this.activeBytecode)));

        // Get the total value on the contract
        int currentValue = tx.inputs[this.activeInputIndex].value;

        // Calculate value returned to the contract
        int returnedValue = currentValue - payout;

        // Check that the outputs send the correct amounts
        require(tx.outputs[0].value >= returnedValue);
    }

}`