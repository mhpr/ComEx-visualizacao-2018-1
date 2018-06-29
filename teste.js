
function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
  
      // Check if the XMLHttpRequest object has a "withCredentials" property.
      // "withCredentials" only exists on XMLHTTPRequest2 objects.
      xhr.open(method, url, true);
  
    } else if (typeof XDomainRequest != "undefined") {
  
      // Otherwise, check if XDomainRequest.
      // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
      xhr = new XDomainRequest();
      xhr.open(method, url);
  
    } else {
  
      // Otherwise, CORS is not supported by the browser.
      xhr = null;
  
    }
    return xhr;
  }

handler = (data) =>{
    console.log(data)
    console.log(data.target.response)
}
get_daaata = () =>{
    console.log("aquiii")
    var invocation = new XMLHttpRequest();
    var url = 'http://localhost:8000/api/getSomething';

    if(invocation) {    
        invocation.open('GET', url, true);
        invocation.onreadystatechange = handler;
        invocation.send(); 
    }
    
}
get_daata = () =>{
    var xhr = createCORSRequest('GET', 'http://localhost:8000/api/getSomething');
    xhr.setRequestHeader('Access-Control-Allow-Origin','*');
    console.log(xhr.send())

}
get_data = (paramns) => {
    const myRequest = new Request('http://localhost:8000/api/getSomething', {method: 'GET'});
    fetch(myRequest)
    .then(response => {
        console.log(response);
        return response.json();
    })
    .then(response =>{
        console.log(JSON.stringify(response))    
    })
    .catch(error => {
        console.log(error);
    });

};

this.get_data()
