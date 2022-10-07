'use strict';

let map, mapEvent, workouts;

///////////////////////////
// Workout class
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  // id :- uniquely identify each workout

  constructor(distance, duration, coords) {
    this.duration = duration;
    this.distance = distance;
    this.coords = coords;
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDay()}`;
  }
}

////////////////////////////
// Subclass of Workout ( Options )
class Running extends Workout {
  type = 'running';
  constructor(distance, duration, coords, cadence) {
    super(distance, duration, coords);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
    // calling the method to calculate the pace automatically
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(distance, duration, coords, elevationGain) {
    super(distance, duration, coords);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();

    // calling the method to calculate the speed automatically
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

class Playing extends Workout {
  type = 'playing';
  constructor(distance, duration, coords, cadence) {
    super(distance, duration, coords);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Walking extends Workout {
  type = 'walking';
  constructor(distance, duration, coords, elevationGain) {
    super(distance, duration, coords);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

////////////////////////////
// Main Class

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #mapEvent;
  #workouts = [];
  #zoomMapView = 13;

  constructor() {
    // get user position
    this._getPosition();

    // get local data
    this._getLocalStorage();

    // event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    // automatically calling these methods at creation of object
  }

  _getPosition() {
    if (navigator.geolocation)
      // get location of user
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert(`could'nt get user location`);
        }
      );
    // 2 method calls -
    // i... successfully getting location
    // ii.. error call
  }

  _loadMap(position) {
    const { longitude } = position.coords;
    const { latitude } = position.coords;
    // lat and long from positions in geolocation

    const coords = [latitude, longitude];

    //   coords are coordinates(lat, long)
    // 13 is the ize of map viewing
    this.#map = L.map('map').setView(coords, this.#zoomMapView);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
    // bind with this is because the showForm method's this will start pointing to the map variable,
    // as it was the value that called the function.
    // by calling bind with this, it will bind the objects this to the function

    this.#workouts.forEach(work => this._renderWorkoutMaker(work));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    // get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;

    // checking workout type and creating objects
    let workout;

    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert('only finite / positive / valid numbers are allowed');
      }
      workout = new Running(distance, duration, [lat, lng], cadence);
    } else if (type === 'playing') {
      const cadence = +inputCadence.value;
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('only finite / positive / valid numbers are allowed');

      workout = new Playing(distance, duration, [lat, lng], cadence);
    } else if (type === 'cycling') {
      const elevationGain = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevationGain) ||
        !allPositive(distance, duration)
      )
        return alert('only finite / positive / valid numbers are allowed');

      workout = new Cycling(distance, duration, [lat, lng], elevationGain);
    } else {
      const elevationGain = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevationGain) ||
        !allPositive(distance, duration)
      )
        return alert('only finite / positive / valid numbers are allowed');

      workout = new Walking(distance, duration, [lat, lng], elevationGain);
    }
    // push workout to workouts array
    this.#workouts.push(workout);

    //  render workout on map maker
    this._renderWorkoutMaker(workout);

    // render workout list
    this._renderWorkout(workout);

    // hide form + clear input fields
    this._hideForm();

    // set local storage for user data
    this._setLocalStorage();
  }

  _renderWorkoutMaker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${this._chooseIcon(workout)} ${workout.description}`)
      .openPopup();
  }

  _chooseIcon(workout) {
    let iconType;
    if (workout.type === 'running') iconType = '🏃‍♂️';
    else if (workout.type === 'cycling') iconType = '🚴‍♂️';
    else if (workout.type === 'playing') iconType = '🛐';
    else iconType = '🚶‍♂️';
    return iconType;
  }

  _renderWorkout(workout) {
    let iconType = this._chooseIcon(workout);

    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${iconType}</span>
            <span class="workout__value">2</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
    `;

    if (workout.type === 'running') {
      html += `<div class="workout__details">
      <span class="workout__icon">💚</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">👣</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>`;
    } else if (workout.type === 'playing') {
      html += `<div class="workout__details">
      <span class="workout__icon">🏅</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">💯</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>`;
    } else if (workout.type === 'cycling') {
      html += `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>`;
    } else {
      html += `<div class="workout__details">
      <span class="workout__icon">🤖</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">😸</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>`;
    }

    form.insertAdjacentHTML('afterend', html);
  }
  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.coords, this.#zoomMapView, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    console.log(workout.clicks);
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;
    this.#workouts.forEach(work => this._renderWorkout(work));
  }
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
