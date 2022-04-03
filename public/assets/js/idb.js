// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'pizza_hunt' and set it to version 1
const request = indexedDB.open('pizza_hunt', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;

    db.createObjectStore('new_pizza', { autoIncrement: true });
};

//upon a successful
request.onsuccess = function (event) {
    //when db is successfully created with its object store (from onupgradeneeded above) or siply established connection, save reference to db in global variable
    db = event.target.result;

    if (nagivator.online) {
        uploadPizza();
    }
};

request.onerror = function (event) {
    console.log(Event.taget.errorCode);
};

function saveRecord(record) {
    //open a new transaction with the database with read and write permission
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    //access the object store for new_pizza
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    pizzaObjectStore.add(record);
};


function uploadPizza () {
    //open transaction to db
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    //access your object store
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    //get all records from store and set to a variable
    const getAll = pizzaObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/pizzas', {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': "application/json"
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_pizza'], "readwrite");

                const pizzaObjectStore = transaction.objectStore('new_pizza');

                pizzaObjectStore.clear();

                alert("All saved pizza has been submitted")
            })
            .catch(err => console.log(err));
        }
    }
}

window.addEventListener('online', uploadPizza);