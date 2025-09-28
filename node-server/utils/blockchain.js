import { 
    Client, PrivateKey, TokenCreateTransaction, TokenMintTransaction, TokenAssociateTransaction, TokenBurnTransaction,
    TransferTransaction, Hbar, AccountId, AccountCreateTransaction, TokenSupplyType, TokenType
} from "@hashgraph/sdk";
import dotenv from "dotenv";

await dotenv.config();
let client;

export async function environmentSetup() {    
    if (client) {
        console.log("Hedera client already initialized");
        return client;
    }
    console.log("Initializing Hedera client...");

    const ACCOUNT_ID = process.env.ACCOUNT_ID;
    const PRIVATE_KEY = process.env.PRIVATE_KEY;

    if (!ACCOUNT_ID || !PRIVATE_KEY) {
        throw new Error("Environment variables ACCOUNT_ID or PRIVATE_KEY are not set");
    }
    const privateKey = PrivateKey.fromString(PRIVATE_KEY);
    client = Client.forTestnet()
                    .setOperator(ACCOUNT_ID, privateKey)
                    .setDefaultMaxTransactionFee(new Hbar(100))
                    .setDefaultMaxQueryPayment(new Hbar(10));

    return client;
}

export async function createEventTicket(eventId, organiserId, organiserKeyStr) {
    if (!client) {
        await environmentSetup();
    }

    const organiser = AccountId.fromString(organiserId);
    const organiserKey = PrivateKey.fromStringDer(organiserKeyStr);

    const nftCreateTx = await new TokenCreateTransaction()
                    .setTokenName(`EventTicket-${eventId}`)
                    .setTokenSymbol(`ET-${eventId}`)
                    .setTokenType(TokenType.NonFungibleUnique)
                    .setDecimals(0)
                    .setInitialSupply(0)
                    .setTreasuryAccountId(organiser)
                    .setAdminKey(organiserKey)
                    .setSupplyType(TokenSupplyType.Infinite)
                    .setSupplyKey(organiserKey)
                    .freezeWith(client);
    
    const nftCreateSign = await nftCreateTx.sign(organiserKey);
    const nftCreateSubmit = await nftCreateSign.execute(client);
    const nftCreateRx = await nftCreateSubmit.getReceipt(client);
    const tokenId = nftCreateRx.tokenId;

    console.log(`Created NFT with Token ID: ${tokenId}`);
    return {
        tokenId: tokenId.toString(), 
        supplyKey: organiserKey.toStringDer()
    };
}

export async function mintAndTransferNFT(
    tokenId, metadata, newOwner, organiser, newOwnerKeyStr, organiserKeyStr
) {
    if (!client) {
        await environmentSetup();
    }
    const buyer = AccountId.fromString(newOwner);
    const buyerkey = PrivateKey.fromStringDer(newOwnerKeyStr);
    const organiserId = AccountId.fromString(organiser);
    const organiserKey = PrivateKey.fromStringDer(organiserKeyStr);

    const mintTx = await new TokenMintTransaction()
                    .setTokenId(tokenId)
                    .setMetadata([Buffer.from(metadata)])
                    .freezeWith(client);
    
    const mintSign = await mintTx.sign(organiserKey);
    const mintSubmit = await mintSign.execute(client);
    const mintRx = await mintSubmit.getReceipt(client);
    const serialNumber = mintRx.serials[0].toString();

    const associateTx = await new TokenAssociateTransaction()
                        .setAccountId(buyer)
                        .setTokenIds([tokenId])
                        .freezeWith(client);

    const associateSign = await associateTx.sign(buyerkey);
    const associateSubmit = await associateSign.execute(client);
    await associateSubmit.getReceipt(client);
    console.log(`Associated token ${tokenId} with account ${newOwner}`);

    const transferTx = await new TransferTransaction()
                        .addNftTransfer(tokenId, serialNumber, organiserId, buyer)
                        .freezeWith(client);
    
    const transferSign = await transferTx.sign(organiserKey);
    const transferSubmit = await transferSign.execute(client);
    await transferSubmit.getReceipt(client);
    console.log(`Transferred NFT with Serial Number: ${serialNumber} to ${newOwner}`);
    
    return serialNumber;
}

export async function burnNFT(tokenId, serialNumber, supplyKeyStr) {
    if (!client) {
        await environmentSetup();
    }
    const supplyKey = PrivateKey.fromStringDer(supplyKeyStr);
    const burnTx = await new TokenBurnTransaction()
                    .setTokenId(tokenId)
                    .setSerialNumbers([serialNumber])
                    .freezeWith(client);
    
    const burnSign = await burnTx.sign(supplyKey);
    const burnSubmit = await burnSign.execute(client);
    const burnRx = await burnSubmit.getReceipt(client);
    console.log(`Burned NFT with Serial Number: ${serialNumber} from Token ID: ${tokenId}`);
    
    return burnRx;
}

export async function createAccount() {
    if (!client) {
        await environmentSetup();
    }

    const newPrivateKey = PrivateKey.generateECDSA();
    const newPublicKey = newPrivateKey.publicKey;

    const newAccountTx = await new AccountCreateTransaction()
                            .setECDSAKeyWithAlias(newPrivateKey)
                            .setInitialBalance(new Hbar(20))
                            .freezeWith(client);

    const newAccountSubmit = await newAccountTx.execute(client);
    const newAccountRx = await newAccountSubmit.getReceipt(client);
    const newAccountId = newAccountRx.accountId;

    console.log(`Created new account with ID: ${newAccountId}`);
    return {
        accountId: newAccountId.toString(),
        privateKey: newPrivateKey.toStringDer(),
        publicKey: newPublicKey.toStringDer()
    };
}