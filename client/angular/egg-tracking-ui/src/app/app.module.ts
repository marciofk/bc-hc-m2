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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { DataService } from './data.service';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

import { EggBoxComponent } from './EggBox/EggBox.component';
import { EggShipmentComponent } from './EggShipment/EggShipment.component';

import { FarmerComponent } from './Farmer/Farmer.component';
import { ShipperComponent } from './Shipper/Shipper.component';
import { DistributorComponent } from './Distributor/Distributor.component';

import { PackEggsTransactionComponent } from './PackEggsTransaction/PackEggsTransaction.component';
import { CreateShipmentTransactionComponent } from './CreateShipmentTransaction/CreateShipmentTransaction.component';
import { LoadTruckTransactionComponent } from './LoadTruckTransaction/LoadTruckTransaction.component';
import { DeliverEggsTransactionComponent } from './DeliverEggsTransaction/DeliverEggsTransaction.component';
import { ReportDamageTransactionComponent } from './ReportDamageTransaction/ReportDamageTransaction.component';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientModule } from '@angular/common/http';




  @NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    EggBoxComponent,
    EggShipmentComponent,
    FarmerComponent,
    ShipperComponent,
    DistributorComponent,
    PackEggsTransactionComponent,
    CreateShipmentTransactionComponent,
    LoadTruckTransactionComponent,
    DeliverEggsTransactionComponent,
    ReportDamageTransactionComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [
    DataService, CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
