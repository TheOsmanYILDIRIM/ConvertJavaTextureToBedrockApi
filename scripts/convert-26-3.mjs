import { ConvertJavaTextureToBedrockApi } from "../src/index.mjs";
import { Input, LocalFileInputEntry, LocalFileOutput, ConsoleLog } from "@modifiedcommand/convert-base-api";
import { stat } from "node:fs/promises";
const [, , source, destination] = process.argv;
if (!source || !destination) { console.error("Usage: node scripts/convert-26-3.mjs input.zip output.mcpack"); process.exit(2); }
const api = new ConvertJavaTextureToBedrockApi(
 new Input(new LocalFileInputEntry(source)), new LocalFileOutput(destination), new ConsoleLog(),
 {javaVersion:"26.3",bedrockVersion:"1.26.50.4",experimental:false}
);
await api.convert();
const st=await stat(destination);
if(st.size<1024)throw new Error("Empty converted file");
console.log(JSON.stringify({output:destination,bytes:st.size}));
