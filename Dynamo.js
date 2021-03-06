
/**
 * Copyright 2010-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * This file is licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License. A copy of
 * the License is located at
 *
 * http://aws.amazon.com/apache2.0/
 *
 * This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
var AWS = require("aws-sdk");
var async = require('async');

AWS.config.update({
  region: "us-west-2",
  endpoint: "https://dynamodb.us-west-2.amazonaws.com"
});

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

const employee = "Employee";
const outsider = "PublicUser";
/*
var params = {
  TableName : "PublicUser",
  KeySchema: [
    { AttributeName: "uid", KeyType: "HASH"},  //Partition key
    // { AttributeName: "title", KeyType: "RANGE" }  //Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: "uid", AttributeType: "S" }
    // { AttributeName: "todo", AttributeType: "S" },
    // { AttributeName: "schedule", AttributeType: "S" },
    // { AttributeName: "hours_worked", AttributeType: "N" },
    // { AttributeName: "sentiment_score", AttributeType: "N" }
    // { AttributeName: "title", AttributeType: "S" }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

dynamodb.createTable(params, function(err, data) {
  if (err) {
    console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
  } else {
    console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
  }
});
*/

function get(emp_id, table_name, id){

}

function insert(emp_id, table_name){

  
  var params = {
    TableName: table_name,
    Item: {
        "uid": emp_id,
        "position" : "salesman",
        "context" : "INITIATE",
        "hours_worked" : "120T45",
        "holiday_left" : "30",
        "sick_leave" : "10",
        "bonus" : "$50,000,000",
        "sales_made" : "30",
        "holiday_bonus" : "$100,000",
        "due_salary" : "2"                
    }
   };
   docClient.put(params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else console.log(data); // successful response
   });


}

// Adding new function for meeting
async function getIdColumn(){
  var params = {
    ExpressionAttributeNames: {
     "#AT": "uid"
    },
    ProjectionExpression: "#AT",
    TableName: "Employee"
   };
   
   return await new Promise( (res, rej) => {
    dynamodb.scan(params, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        rej({ statusCode: 400 });
      }
      else {
        res(data);    //returns data     
        console.log(data);           // successful response
      }
     });
   });
}

// Adding new function for meeting
async function getAllMeetings(){
  var params = {
    TableName: "Schedule"
   };

   return await new Promise( (res, rej) => {
    dynamodb.scan(params, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        rej({ statusCode: 400 });
      }
      else {
        res(data);    //returns data
        console.log(data);           // successful response
      }
     });
   });
}

// New fucntion for meeting ends

async function getHelper(params){
  return await new Promise( (res, rej) => {
    docClient.get(params, function(err, data) {
      if (err) {
          console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
          rej({ statusCode: 400 });
      } else {
          res(data);    //returns data
          console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
      }
    });
  });
}

async function getUserInfo(emp_id, table_name){
  var params = {
    TableName: table_name,
    Key:{
        "uid": emp_id,
    }

  };

  var result = await getHelper(params);

  console.log("This is Get Helper");
  console.log(result);

  var exists = false;

  if (result.Item !== undefined && result.Item !== null) {
    exists = true
  }

  return  result;
}

async function getMeetingInfo(set_by){
  var params = {
    TableName: "Schedule",
    Key: {
        "set_by": set_by,
    }

  };

  var result = await getHelper(params);

  console.log("This is Get Helper for meeting");
  console.log(result);

  var exists = false;

  if (result.Item !== undefined && result.Item !== null) {
    exists = true
  }

  return  result;
}

function updateUserState(user_id, table_name,state){
    var params = {
        TableName:table_name,
        Key:{
            "uid" : user_id
        },
        UpdateExpression: "set context =:s",
        ExpressionAttributeValues:{
            ":s": state

        },
        ReturnValues:"UPDATED_NEW"
    };

    console.log("Updating USER STATE");
    docClient.update(params, function(err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
        }
    });

}

function updateReminder(user_id, table_name, data){
    let params;
    let ind=data['ind']+"";
    delete data.ind;
  params = {
    TableName: table_name,
    Key: {
      "uid": user_id
    },
    UpdateExpression: "set reminders = list_append(if_not_exists(reminders, :empty_list), :s)",
    ExpressionAttributeValues: {
      ":s": [data],
      ':empty_list': []

    },
    ReturnValues: "UPDATED_NEW"
  };
    if (ind==="-1") {
      console.log("updating old");
    }
    else{
      console.log("updating new");
      params.UpdateExpression = "set reminders[" + ind + "] = :s";
      params.ExpressionAttributeValues = {
        ":s" : data
      };

    }


    docClient.update(params, function(err, data) {
      if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
      }
    });

}
function deleteReminder(user_id, table_name, data){
  console.log(data)
    let params;
  params = {
    TableName: table_name,
    Key: {
      "uid": user_id
    },
    UpdateExpression: "set reminders = :s",
    ExpressionAttributeValues: {
      ":s": data

    },
    ReturnValues: "UPDATED_NEW"
  };



    docClient.update(params, function(err, data) {
      if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
      }
    });

}

function updateAttendingMeeting(setBy, attendee ){

  let params = {
    TableName: "Schedule",
    Key: {
      "set_by": setBy
    },
    UpdateExpression: "set attendees = list_append(if_not_exists(attendees, :empty_list), :s)",
    ExpressionAttributeValues: {
      ":s": [attendee],
      ':empty_list': []

    },
    ReturnValues: "UPDATED_NEW"
  };


    docClient.update(params, function(err, data) {
      if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
      }
    });
}


function updateDecliningMeeting(setBy, decliners){

  let params = {
    TableName: "Schedule",
    Key: {
      "set_by": setBy
    },
    UpdateExpression: "set decliners = list_append(if_not_exists(decliners, :empty_list), :s)",
    ExpressionAttributeValues: {
      ":s": [decliners],
      ':empty_list': []

    },
    ReturnValues: "UPDATED_NEW"
  };


    docClient.update(params, function(err, data) {
      if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
      }
    });
}



function createMeeting(data){

  var params = {
    TableName: "Schedule",
    Item: data  // set_by  and time
  };
  docClient.put(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else console.log(data); // successful response
  });

}


module.exports = {
  getUserInfo,
  insert,
  get,
  updateUserState,
  updateReminder,
  getIdColumn,
  createMeeting,
  updateAttendingMeeting,
  getAllMeetings,
  getMeetingInfo,
  updateDecliningMeeting,
  deleteReminder
}