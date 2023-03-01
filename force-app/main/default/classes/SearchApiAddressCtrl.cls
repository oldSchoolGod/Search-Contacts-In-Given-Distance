public class SearchApiAddressCtrl {

    @AuraEnabled
    Public Static list<SuggestionWrapper> getAddress(String searchString){
        if(String.isNotBlank(searchString)){
            system.debug('searchString' + searchString);
            List<SuggestionWrapper> suggestions=new List<SuggestionWrapper>();
            searchString = EncodingUtil.urlEncode(searchString, 'UTF-8');
             system.debug('searchString2' + searchString);
            Http http = new Http();
            HttpRequest Request = new HttpRequest();
            Request.setMethod('GET');
            Request.setEndPoint('https://maps.googleapis.com/maps/api/place/autocomplete/json?input='+searchString+'&key=AIzaSyALaRlPFhI9nH_NofftZvcNNqaNL6trq48');
            HttpResponse Response = http.send(Request);
            if(Response.getStatusCode()==200){
                System.debug('res.getbody' + Response.getBody());
                JSON2ApexSuggestion Json2Apex= parseSuggestion(Response.getbody());
                System.debug('Json2Apex' + Json2Apex);
                string CompleteAddress = '';
                List<String> completeaddressList = new List<String>();
                if(Json2Apex.Predictions != null){
                    System.debug('Json2Apex.Predictions' + Json2Apex.Predictions);
                    for(JSON2ApexSuggestion.Predictions Prediction : Json2Apex.Predictions){
                        if(string.isNotBlank(Prediction.description)){
                            CompleteAddress = Prediction.description;
                            CompleteAddress = CompleteAddress.replaceAll(',', ' ');
                            suggestions.add(new SuggestionWrapper(CompleteAddress,Prediction.place_id));
                        }
                    }
                }
                return suggestions;  
            }
             
        }
        return null;
    }
     
    @AuraEnabled
    public static string getPlaceDetails(String placeId) {
        
        if(String.isNotBlank(placeId)){
            String strURL = 'https://maps.googleapis.com/maps/api/place/details/json?'
                + 'placeid=' + EncodingUtil.urlEncode(placeId, 'UTF-8')
                + '&key=AIzaSyALaRlPFhI9nH_NofftZvcNNqaNL6trq48'; 
            Http h = new Http();
            HttpRequest req = new HttpRequest();
            HttpResponse res = new HttpResponse();
            req.setMethod('GET');
            req.setEndpoint(strURL);
            req.setTimeout(120000);
            res = h.send(req); 
            String responseBody = res.getBody(); 
            system.debug('responseBody---'+ responseBody);
            Map<String, Object> resp = (Map<String, Object>)JSON.deserializeUntyped(res.getBody());
            System.debug('lon' + resp.get('result'));
            
            
            return responseBody; 
        }else{
            return null;
        }
        
    }
     
    public class SuggestionWrapper{
        @AuraEnabled
        public String AddComplete{get;set;}
        @AuraEnabled
        public String placeId{get;set;}
         
        public SuggestionWrapper(string AddComplete,String placeId){
            this.AddComplete = AddComplete;
            this.placeId = placeId;
        }
    }   
    
    @AuraEnabled
    public static List<Contact> getRecordInGivenMiles(String latitude, String longitude, String unit, String distance){
        System.Debug('lat' + latitude);
        System.Debug('long' + longitude);
        System.Debug('Unit' + unit);
        System.Debug('distance ' + distance);
        String units = '\''+ unit + '\'';
        List<Contact> contacts = new List<Contact>();
        
        String query = 'SELECT Id,FirstName,LastName,MailingAddress from Contact WHERE DISTANCE(MailingAddress, GEOLOCATION(' + latitude + ', ' + longitude + ' ),'+units+') <'+ distance;
              
       // List<Contact> listOfContacts = Database.query('SELECT Id,FirstName,LastName,MailingLatitude,MailingLongitude from Contact WHERE DISTANCE(MailingAddress, GEOLOCATION(' + lat + ', ' + longitude + ' ), \'mi\') < 10');
        
        contacts = Database.query(query);
        System.debug('list Of Contacts ' +contacts );
        return contacts;
    }
         
    public static JSON2ApexSuggestion parseSuggestion(String json) {
        return (JSON2ApexSuggestion) System.JSON.deserialize(json, JSON2ApexSuggestion.class);
    }
    
}