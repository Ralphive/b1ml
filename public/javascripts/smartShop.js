var defultImage = 'https://pingendo.com/assets/photos/wireframe/photo-1.jpg';
var body = {}
$(document).ready(function(){  

  $(".form-horizontal").submit(function(){
    var $inputs = $("#"+this.id+' :input');
    var i = 0;
    $inputs.each(function() {
      if (this.id == "user")
        body.user = $(this).val();
      else
        if  ($(this).val() != ""){
          body.pics[i] = {url: $(this).val()};
          i++;
        }
       
    });

    if (this.id == "train")
      trainSystem(body);
    else
      testSystem(body);

    return false; //avoid refresh

  });

  $( "input[type='url']" ).change(function() {
    if ($(this).val() == '')
      changeImage(this.id, defultImage)
    else
      changeImage(this.id, $(this).val())
  });

  initialize();

});

function changeImage(id, url){
  $("#img-"+id).attr("src",url);
}

function trainSystem(body){
  postData("/trainSystem", body, function(data){
    alert(JSON.stringify(data));
  })


}

function testSystem(body){
  postData("./searchFace", body, function(data){
    var alert = 'success'
    
    if(data.user == undefined){
      alert = 'danger'
      $("#resultAlert").html('<h4 class="alert-heading">NOT MY CUSTOMER</h4>');
    }else{
      $("#resultAlert").html('<h4 class="alert-heading">Looks like '+data.user+
                        '</h4><p>Similarity: '+data.Similarity+'%');
    }
    
    $("#resultAlert").attr('class', 'alert alert-'+alert+' pi-draggable collapse');
    $("#resultAlert").show();
  })
}

function initialize(){
  body = {
    user: "",
    pics: []}
}

function postData(endpoint, body, callback){
   $.ajax({
      url: endpoint,
      type: 'POST',
      data: JSON.stringify(body),
      dataType : "json",
      contentType: "application/json",
      success: function(data){
          return callback(data);
      },
      error: function( xhr, status, errorThrown ) {
        alert (errorThrown);
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
        console.dir( xhr );
      },
  });

}

