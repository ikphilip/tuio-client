const socket = io('http://localhost:5000');

// Tracking variables
let currentSessions = [];
let currentObjects = {};

/**
* Tracking function.
*/
const updateCurrentObjects = (session) => {
  // Don't update if there is duplicate
  if (session.duplicate === true) {
    return;
  }

  // If there are no sessions then just exit
  if (!session.messages[1].sessionIds) {
    removeAll();
    return;
  }

  newSessions = session.messages[1].sessionIds;

  // Cut short if there is nothing to do
  if (newSessions == currentSessions) {
    console.log('No changes');
    return;
  }

  // Check for removed objects
  currentSessions.forEach((x, i) => {
    if (newSessions.indexOf(x) < 0) {
      currentSessions.splice(i, 1);
      delete currentObjects[x];
      removeFiducial(x);
      console.log('Delete', x, currentObjects);
    }
  });

  // Check for added objects
  newSessions.forEach((x) => {
    if (currentSessions.indexOf(x) < 0) {
      for (let y of session.messages) {
        if (y.type === 'set' && y.sessionId === x) {
          currentSessions.push(x);
          currentObjects[x] = y;
          addFiducial(currentObjects[x]);
          break;
        }
      }

      console.log('Add', x, currentObjects);
    }
  });
};

const addFiducial = (message) => {
  const fiducials = document.getElementById("fiducials");
  const newDiv = document.createElement('div');
  const newContent = document.createTextNode(message.classId);
  newDiv.append(newContent);
  newDiv.id = message.sessionId;
  fiducials.append(newDiv);
};

const removeFiducial = (sessionId) => {
  const fiducial = document.getElementById(sessionId);

  if (fiducial) {
    fiducial.remove();
  }
};

const removeAll = () => {
  let currentSessions = [];
  let currentObjects = {};
  const fiducials = document.getElementById("fiducials");
  while(fiducials.firstChild) {
    fiducials.removeChild(fiducials.firstChild);
  }
  console.log('remove all');
};

socket.on('tuio', (msg) => {
  // @TODO Handle event logic when messages are received.
  updateCurrentObjects(msg);
});
