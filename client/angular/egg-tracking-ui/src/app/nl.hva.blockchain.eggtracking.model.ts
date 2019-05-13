import {Asset} from './org.hyperledger.composer.system';
import {Participant} from './org.hyperledger.composer.system';
import {Transaction} from './org.hyperledger.composer.system';
import {Event} from './org.hyperledger.composer.system';
import {Farmer,Member,Shipper,Distributor} from './nl.hva.blockchain.eggtracking.model.participant';
// export namespace nl.hva.blockchain.eggtracking.model{
   export enum BoxStatus {
      PACKED,
      READY_FOR_SHIPMENT,
      IN_TRANSIT,
      IN_DISTRIBUTION_CENTRE,
      DAMAGED,
   }
   export enum ShippingStatus {
      READY,
      LOADED,
      DELIVERED,
   }
   export class EggBox extends Asset {
      boxId: string;
      packingTimestamp: Date;
      status: BoxStatus;
      quantity: number;
      origin: Farmer;
      holder: Member;
   }
   export class EggShipment extends Asset {
      shipmentId: string;
      creation: Date;
      loadTimestamp: Date;
      eggs: EggBox[];
      shipper: Shipper;
      from: Farmer;
      to: Distributor;
      status: ShippingStatus;
      deliveryDate: Date;
   }
   export class PackEggsTransaction extends Transaction {
      producer: Farmer;
      quantity: number;
      packingTimestamp: Date;
   }
   export class CreateShipmentTransaction extends Transaction {
      shipper: Shipper;
      from: Farmer;
      to: Distributor;
      creation: Date;
      min: number;
      max: number;
   }
   export class LoadTruckTransaction extends Transaction {
      shipment: EggShipment;
      loadTimestamp: Date;
   }
   export class DeliverEggsTransaction extends Transaction {
      shipment: EggShipment;
      deliveryDate: Date;
   }
   export class ReportDamageTransaction extends Transaction {
      box: EggBox;
      when: Date;
   }
   export class ShipmentCreated extends Event {
      shipmentId: string;
      shipperId: string;
   }
   export class ShipmentDelivered extends Event {
      shipmentId: string;
      distId: string;
   }
// }
