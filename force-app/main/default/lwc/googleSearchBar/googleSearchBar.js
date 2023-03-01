import { LightningElement } from 'lwc';
import getAddress from '@salesforce/apex/SearchApiAddressCtrl.getAddress';
import getAddressDetailsByPlaceId from '@salesforce/apex/SearchApiAddressCtrl.getPlaceDetails';
import findContacts from '@salesforce/apex/SearchApiAddressCtrl.getRecordInGivenMiles';


const columns = [
    { label: 'FirstName', fieldName: 'conName',type: 'url',
    typeAttributes: {label: { fieldName: 'FirstName' }, target: '_blank'}
},
    { label: 'Last Name', fieldName: 'LastName' },
];
  
export default class SearchAPIAddress extends LightningElement {
    addressRecommendations = [];
    selectedAddress = '';
    addressDetail = {};
    city;
    country;
    pincode;
    state;
    street;
    contacts;
    latitude;
    longitude;
    distance;

    columns = columns;
    
  
    get hasRecommendations() {
       //("this.addressRecommendations "+JSON.stringify(this.addressRecommendations));
        console.log("this.addressRecommendations "+JSON.stringify(this.addressRecommendations));
        return (this.addressRecommendations !== null && this.addressRecommendations.length);
    }
     
    handleChange(event) {
        event.preventDefault();
        let searchText = event.target.value;
        if (searchText) this.getAddressRecommendations(searchText);
        else this.addressRecommendations = [];
    }
  
    getAddressRecommendations(searchText) {
        getAddress({ searchString: searchText })
            .then(response => {
                let addressRecommendations = [];
                response.forEach(prediction => {
                    addressRecommendations.push({
                        main_text: prediction.AddComplete,
                        secondary_text: prediction.AddComplete,
                        place_id: prediction.placeId,
                    });
                });
                this.addressRecommendations = addressRecommendations;
            }).catch(error => {
                console.log('error : ' + JSON.stringify(error));
            });
    }
 
    resetAddress(){
        this.city = '';
        this.country = '';
        this.pincode = '';
        this.state = '';
    }
  
    handleAddressRecommendationSelect(event) {
        event.preventDefault();
        let placeId = event.currentTarget.dataset.value;
        this.addressRecommendations = [];
        this.selectedAddress = '';
        this.resetAddress();
         
 
        getAddressDetailsByPlaceId({ placeId: placeId })
            .then(response => {
                response = JSON.parse(response);
              this.latitude =  response.result.geometry.location.lat;
              this.longitude =  response.result.geometry.location.lng;
                response.result.address_components.forEach(address => {
                    let type = address.types[0];
                    switch (type) {
                        case 'locality':
                            this.selectedAddress = this.selectedAddress + ' ' + address.long_name;
                            this.city = address.long_name;
                            break;
                        case 'country':
                            this.selectedAddress = this.selectedAddress + ' ' + address.long_name;
                            this.country = address.long_name;
                            break;
                        case 'administrative_area_level_1':
                            this.selectedAddress = this.selectedAddress + ' ' + address.short_name;
                            this.state = address.short_name;
                            break;
                        case 'postal_code':
                            this.selectedAddress = this.selectedAddress + ' ' + address.long_name;
                            this.pincode = address.long_name;
                            break;
                        case 'sublocality_level_2':
                            this.selectedAddress = this.selectedAddress + ' ' + address.long_name;
                            this.addressDetail.subLocal2 = address.long_name;
                            break;
                        case 'sublocality_level_1':
                            this.selectedAddress = this.selectedAddress + ' ' + address.long_name;
                            this.addressDetail.subLocal1 = address.long_name;
                            break;
                        case 'street_number':
                            this.selectedAddress = this.selectedAddress + ' ' + address.long_name;
                            this.addressDetail.streetNumber = address.long_name;
                            this.street = address.long_name;
                            break;
                        case 'route':
                            this.selectedAddress = this.selectedAddress + ' ' + address.short_name;
                            this.addressDetail.route = address.short_name;
                            break;
                        default:
                            break;
                    }
                    var address = {
                        street: this.street,
                        city : this.city,
                        state : this.state,
                        country: this.country,
                        zipCode : this.pincode
                        
                    }
                    
                    console.log("address in LWC"+JSON.stringify(address));
                    this.valueFromLwc = address;
                    const addresses = new CustomEvent("valuechange", {
                        detail: { valueFromLwc: this.valueFromLwc}
                    });
                    // Fire the custom event
                    this.dispatchEvent(addresses);
                });
            })
            .catch(error => {
                console.log('error : ' + JSON.stringify(error));
            });
           
    
    }

    handleClick(event) {
        console.log('hello');
        const inputField = this.template.querySelector('.name');
        if (!inputField.value) {
            console.log('hello3');
            // Input field is empty
            inputField.setCustomValidity('Please enter Distance');
            inputField.reportValidity();
        }else{

        findContacts({ latitude: this.latitude, longitude: this.longitude, unit: this.value, distance:this.distance})
            .then((result) => {
                console.log('Contacts' + JSON.stringify(result));
                this.contacts = result.map(type => {
                    
                    // TODO: complete the logic
                    return {
                         conName:'/' + type.Id,
                         FirstName: type.FirstName,
                         LastName: type.LastName,
                         
                    }
                  });
                this.error = undefined;
            })
            .catch((error) => {
                this.error = error;
                this.contacts = undefined;
            });
        }
    }

    value = 'Km';

    get options() {
        return [
            { label: 'Km', value: 'Km' },
            { label: 'Mi', value: 'Mi' },
        ];
    }

    handleChangeUnit(event) {
        this.value = event.detail.value;
    }

    handleInputChange(event){
      this.distance = event.target.value;
    }

//    addressInputChange( event ) {

//         this.city =  event.target.city;
//         this.state = event.target.state;
//         this.country = event.target.country;
//         this.pincode = event.target.pincode;

       
//     }

}