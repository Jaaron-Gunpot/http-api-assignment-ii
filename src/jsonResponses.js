const users = {};

const respond = (request, response, status, content) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(content));
  response.end();
};

const respondMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

// unchecked
const getUsers = (request, response) => {
  const responseJSON = {
    users,
  };
  respond(request, response, 200, responseJSON);
};

const getUsersMeta = (request, response) => {
  respondMeta(request, response, 200);
};

const notReal = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notReal',
  };
  respond(request, response, 404, responseJSON);
};

const notRealMeta = (request, response) => {
  respondMeta(request, response, 404);
};

const addUser = (request, response, body) => {
    console.log(`addUser:${body}`);

  // default json message
  const responseJSON = {
    message: 'Name and age are both required.',
  };

  // if there are no parameters, then return a 400 bad request
  if (!body.name || !body.age) {
    responseJSON.id = 'missingParams';
    return respond(request, response, 400, responseJSON);
  }

  // default status code to 204 updated
  let responseCode = 204;

  // If the user doesn't exist yet
  if (!users[body.name]) {
    // Set the status code to 201 (created) and create an empty user
    responseCode = 201;
    users[body.name] = {};
  }

  // add or update fields for this user name
  users[body.name].name = body.name;
  users[body.name].age = body.age;

  console.log(users);

  // if response is created, then set our created message
  // and sent response with a message
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respond(request, response, responseCode, responseJSON);
  }
  // 204 has an empty payload, just a success
  // It cannot have a body, so we just send a 204 without a message
  // 204 will not alter the browser in any way!!!
  return respondMeta(request, response, responseCode);
};

module.exports = {
  getUsers,
  getUsersMeta,
  addUser,
  notReal,
  notRealMeta,
};
