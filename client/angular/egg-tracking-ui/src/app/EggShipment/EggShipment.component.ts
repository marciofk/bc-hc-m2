/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { EggShipmentService } from './EggShipment.service';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'app-eggshipment',
  templateUrl: './EggShipment.component.html',
  styleUrls: ['./EggShipment.component.css'],
  providers: [EggShipmentService]
})
export class EggShipmentComponent implements OnInit {

  myForm: FormGroup;

  private allAssets;
  private asset;
  private currentId;
  private errorMessage;

  shipmentId = new FormControl('', Validators.required);
  creation = new FormControl('', Validators.required);
  loadTimestamp = new FormControl('', Validators.required);
  eggs = new FormControl('', Validators.required);
  shipper = new FormControl('', Validators.required);
  from = new FormControl('', Validators.required);
  to = new FormControl('', Validators.required);
  status = new FormControl('', Validators.required);
  deliveryDate = new FormControl('', Validators.required);

  constructor(public serviceEggShipment: EggShipmentService, fb: FormBuilder) {
    this.myForm = fb.group({
      shipmentId: this.shipmentId,
      creation: this.creation,
      loadTimestamp: this.loadTimestamp,
      eggs: this.eggs,
      shipper: this.shipper,
      from: this.from,
      to: this.to,
      status: this.status,
      deliveryDate: this.deliveryDate
    });
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): Promise<any> {
    const tempList = [];
    return this.serviceEggShipment.getAll()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      result.forEach(asset => {
        tempList.push(asset);
      });
      this.allAssets = tempList;
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

	/**
   * Event handler for changing the checked state of a checkbox (handles array enumeration values)
   * @param {String} name - the name of the asset field to update
   * @param {any} value - the enumeration value for which to toggle the checked state
   */
  changeArrayValue(name: string, value: any): void {
    const index = this[name].value.indexOf(value);
    if (index === -1) {
      this[name].value.push(value);
    } else {
      this[name].value.splice(index, 1);
    }
  }

	/**
	 * Checkbox helper, determining whether an enumeration value should be selected or not (for array enumeration values
   * only). This is used for checkboxes in the asset updateDialog.
   * @param {String} name - the name of the asset field to check
   * @param {any} value - the enumeration value to check for
   * @return {Boolean} whether the specified asset field contains the provided value
   */
  hasArrayValue(name: string, value: any): boolean {
    return this[name].value.indexOf(value) !== -1;
  }

  addAsset(form: any): Promise<any> {
    this.asset = {
      $class: 'nl.hva.blockchain.eggtracking.model.EggShipment',
      'shipmentId': this.shipmentId.value,
      'creation': this.creation.value,
      'loadTimestamp': this.loadTimestamp.value,
      'eggs': this.eggs.value,
      'shipper': this.shipper.value,
      'from': this.from.value,
      'to': this.to.value,
      'status': this.status.value,
      'deliveryDate': this.deliveryDate.value
    };

    this.myForm.setValue({
      'shipmentId': null,
      'creation': null,
      'loadTimestamp': null,
      'eggs': null,
      'shipper': null,
      'from': null,
      'to': null,
      'status': null,
      'deliveryDate': null
    });

    return this.serviceEggShipment.addAsset(this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.myForm.setValue({
        'shipmentId': null,
        'creation': null,
        'loadTimestamp': null,
        'eggs': null,
        'shipper': null,
        'from': null,
        'to': null,
        'status': null,
        'deliveryDate': null
      });
      this.loadAll();
    })
    .catch((error) => {
      if (error === 'Server error') {
          this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else {
          this.errorMessage = error;
      }
    });
  }


  updateAsset(form: any): Promise<any> {
    this.asset = {
      $class: 'nl.hva.blockchain.eggtracking.model.EggShipment',
      'creation': this.creation.value,
      'loadTimestamp': this.loadTimestamp.value,
      'eggs': this.eggs.value,
      'shipper': this.shipper.value,
      'from': this.from.value,
      'to': this.to.value,
      'status': this.status.value,
      'deliveryDate': this.deliveryDate.value
    };

    return this.serviceEggShipment.updateAsset(form.get('shipmentId').value, this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.loadAll();
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }


  deleteAsset(): Promise<any> {

    return this.serviceEggShipment.deleteAsset(this.currentId)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.loadAll();
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  setId(id: any): void {
    this.currentId = id;
  }

  getForm(id: any): Promise<any> {

    return this.serviceEggShipment.getAsset(id)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      const formObject = {
        'shipmentId': null,
        'creation': null,
        'loadTimestamp': null,
        'eggs': null,
        'shipper': null,
        'from': null,
        'to': null,
        'status': null,
        'deliveryDate': null
      };

      if (result.shipmentId) {
        formObject.shipmentId = result.shipmentId;
      } else {
        formObject.shipmentId = null;
      }

      if (result.creation) {
        formObject.creation = result.creation;
      } else {
        formObject.creation = null;
      }

      if (result.loadTimestamp) {
        formObject.loadTimestamp = result.loadTimestamp;
      } else {
        formObject.loadTimestamp = null;
      }

      if (result.eggs) {
        formObject.eggs = result.eggs;
      } else {
        formObject.eggs = null;
      }

      if (result.shipper) {
        formObject.shipper = result.shipper;
      } else {
        formObject.shipper = null;
      }

      if (result.from) {
        formObject.from = result.from;
      } else {
        formObject.from = null;
      }

      if (result.to) {
        formObject.to = result.to;
      } else {
        formObject.to = null;
      }

      if (result.status) {
        formObject.status = result.status;
      } else {
        formObject.status = null;
      }

      if (result.deliveryDate) {
        formObject.deliveryDate = result.deliveryDate;
      } else {
        formObject.deliveryDate = null;
      }

      this.myForm.setValue(formObject);

    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  resetForm(): void {
    this.myForm.setValue({
      'shipmentId': null,
      'creation': null,
      'loadTimestamp': null,
      'eggs': null,
      'shipper': null,
      'from': null,
      'to': null,
      'status': null,
      'deliveryDate': null
      });
  }

}
