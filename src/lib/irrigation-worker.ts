import {proposeIrrigation,type SprinklerId,type IrrigationOptions} from './irrigation-optimizer.ts';
import type {Plan} from './map-model.ts';
const w=self as unknown as {onmessage:((e:MessageEvent<{plan:Plan;item:SprinklerId;limit:number;options:IrrigationOptions}>)=>void)|null;postMessage:(data:unknown)=>void};
w.onmessage=({data})=>{try{w.postMessage({ok:true,result:proposeIrrigation(data.plan,data.item,data.limit,data.options)})}catch(e){w.postMessage({ok:false,error:e instanceof Error?e.message:'Irrigation calculation failed'})}};
