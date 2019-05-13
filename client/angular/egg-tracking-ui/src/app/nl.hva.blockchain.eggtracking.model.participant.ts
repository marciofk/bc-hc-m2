import {Asset} from './org.hyperledger.composer.system';
import {Participant} from './org.hyperledger.composer.system';
import {Transaction} from './org.hyperledger.composer.system';
import {Event} from './org.hyperledger.composer.system';
// export namespace nl.hva.blockchain.eggtracking.model.participant{
   export abstract class Member extends Participant {
      memberId: string;
      name: string;
      streetName: string;
      postalCode: string;
      city: string;
      country: string;
   }
   export class Farmer extends Member {
   }
   export class Shipper extends Member {
   }
   export class Distributor extends Member {
   }
// }
