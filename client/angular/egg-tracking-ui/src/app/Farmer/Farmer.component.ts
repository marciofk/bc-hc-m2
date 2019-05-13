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
import { FarmerService } from './Farmer.service';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'app-farmer',
  templateUrl: './Farmer.component.html',
  styleUrls: ['./Farmer.component.css'],
  providers: [FarmerService]
})
export class FarmerComponent implements OnInit {

  myForm: FormGroup;

  private allParticipants;
  private participant;
  private currentId;
  private errorMessage;

  memberId = new FormControl('', Validators.required);
  name = new FormControl('', Validators.required);
  streetName = new FormControl('', Validators.required);
  postalCode = new FormControl('', Validators.required);
  city = new FormControl('', Validators.required);
  country = new FormControl('', Validators.required);


  constructor(public serviceFarmer: FarmerService, fb: FormBuilder) {
    this.myForm = fb.group({
      memberId: this.memberId,
      name: this.name,
      streetName: this.streetName,
      postalCode: this.postalCode,
      city: this.city,
      country: this.country
    });
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): Promise<any> {
    const tempList = [];
    return this.serviceFarmer.getAll()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      result.forEach(participant => {
        tempList.push(participant);
      });
      this.allParticipants = tempList;
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
        this.errorMessage = error;
      }
    });
  }

	/**
   * Event handler for changing the checked state of a checkbox (handles array enumeration values)
   * @param {String} name - the name of the participant field to update
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
   * only). This is used for checkboxes in the participant updateDialog.
   * @param {String} name - the name of the participant field to check
   * @param {any} value - the enumeration value to check for
   * @return {Boolean} whether the specified participant field contains the provided value
   */
  hasArrayValue(name: string, value: any): boolean {
    return this[name].value.indexOf(value) !== -1;
  }

  addParticipant(form: any): Promise<any> {
    this.participant = {
      $class: 'nl.hva.blockchain.eggtracking.model.participant.Farmer',
      'memberId': this.memberId.value,
      'name': this.name.value,
      'streetName': this.streetName.value,
      'postalCode': this.postalCode.value,
      'city': this.city.value,
      'country': this.country.value
    };

    this.myForm.setValue({
      'memberId': null,
      'name': null,
      'streetName': null,
      'postalCode': null,
      'city': null,
      'country': null
    });

    return this.serviceFarmer.addParticipant(this.participant)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.myForm.setValue({
        'memberId': null,
        'name': null,
        'streetName': null,
        'postalCode': null,
        'city': null,
        'country': null
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


   updateParticipant(form: any): Promise<any> {
    this.participant = {
      $class: 'nl.hva.blockchain.eggtracking.model.participant.Farmer',
      'name': this.name.value,
      'streetName': this.streetName.value,
      'postalCode': this.postalCode.value,
      'city': this.city.value,
      'country': this.country.value
    };

    return this.serviceFarmer.updateParticipant(form.get('memberId').value, this.participant)
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


  deleteParticipant(): Promise<any> {

    return this.serviceFarmer.deleteParticipant(this.currentId)
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

    return this.serviceFarmer.getparticipant(id)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      const formObject = {
        'memberId': null,
        'name': null,
        'streetName': null,
        'postalCode': null,
        'city': null,
        'country': null
      };

      if (result.memberId) {
        formObject.memberId = result.memberId;
      } else {
        formObject.memberId = null;
      }

      if (result.name) {
        formObject.name = result.name;
      } else {
        formObject.name = null;
      }

      if (result.streetName) {
        formObject.streetName = result.streetName;
      } else {
        formObject.streetName = null;
      }

      if (result.postalCode) {
        formObject.postalCode = result.postalCode;
      } else {
        formObject.postalCode = null;
      }

      if (result.city) {
        formObject.city = result.city;
      } else {
        formObject.city = null;
      }

      if (result.country) {
        formObject.country = result.country;
      } else {
        formObject.country = null;
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
      'memberId': null,
      'name': null,
      'streetName': null,
      'postalCode': null,
      'city': null,
      'country': null
    });
  }
}
