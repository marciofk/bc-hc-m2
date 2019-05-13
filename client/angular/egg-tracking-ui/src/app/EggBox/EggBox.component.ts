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
import { EggBoxService } from './EggBox.service';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'app-eggbox',
  templateUrl: './EggBox.component.html',
  styleUrls: ['./EggBox.component.css'],
  providers: [EggBoxService]
})
export class EggBoxComponent implements OnInit {

  myForm: FormGroup;

  private allAssets;
  private asset;
  private currentId;
  private errorMessage;

  boxId = new FormControl('', Validators.required);
  packingTimestamp = new FormControl('', Validators.required);
  status = new FormControl('', Validators.required);
  quantity = new FormControl('', Validators.required);
  origin = new FormControl('', Validators.required);
  holder = new FormControl('', Validators.required);

  constructor(public serviceEggBox: EggBoxService, fb: FormBuilder) {
    this.myForm = fb.group({
      boxId: this.boxId,
      packingTimestamp: this.packingTimestamp,
      status: this.status,
      quantity: this.quantity,
      origin: this.origin,
      holder: this.holder
    });
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): Promise<any> {
    const tempList = [];
    return this.serviceEggBox.getAll()
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
      $class: 'nl.hva.blockchain.eggtracking.model.EggBox',
      'boxId': this.boxId.value,
      'packingTimestamp': this.packingTimestamp.value,
      'status': this.status.value,
      'quantity': this.quantity.value,
      'origin': this.origin.value,
      'holder': this.holder.value
    };

    this.myForm.setValue({
      'boxId': null,
      'packingTimestamp': null,
      'status': null,
      'quantity': null,
      'origin': null,
      'holder': null
    });

    return this.serviceEggBox.addAsset(this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.myForm.setValue({
        'boxId': null,
        'packingTimestamp': null,
        'status': null,
        'quantity': null,
        'origin': null,
        'holder': null
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
      $class: 'nl.hva.blockchain.eggtracking.model.EggBox',
      'packingTimestamp': this.packingTimestamp.value,
      'status': this.status.value,
      'quantity': this.quantity.value,
      'origin': this.origin.value,
      'holder': this.holder.value
    };

    return this.serviceEggBox.updateAsset(form.get('boxId').value, this.asset)
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

    return this.serviceEggBox.deleteAsset(this.currentId)
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

    return this.serviceEggBox.getAsset(id)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      const formObject = {
        'boxId': null,
        'packingTimestamp': null,
        'status': null,
        'quantity': null,
        'origin': null,
        'holder': null
      };

      if (result.boxId) {
        formObject.boxId = result.boxId;
      } else {
        formObject.boxId = null;
      }

      if (result.packingTimestamp) {
        formObject.packingTimestamp = result.packingTimestamp;
      } else {
        formObject.packingTimestamp = null;
      }

      if (result.status) {
        formObject.status = result.status;
      } else {
        formObject.status = null;
      }

      if (result.quantity) {
        formObject.quantity = result.quantity;
      } else {
        formObject.quantity = null;
      }

      if (result.origin) {
        formObject.origin = result.origin;
      } else {
        formObject.origin = null;
      }

      if (result.holder) {
        formObject.holder = result.holder;
      } else {
        formObject.holder = null;
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
      'boxId': null,
      'packingTimestamp': null,
      'status': null,
      'quantity': null,
      'origin': null,
      'holder': null
      });
  }

}
