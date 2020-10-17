'use strict';

class Note {
  constructor() {
    this.name = 'New';
    this.text = '';
    this.id = Date.now();
    this.selected = false;
  }
  getName() {
    return this.name;
  }
  getText() {
    return this.text;
  }
  getId() {
    return this.id;
  }
  getSelected() {
    return this.selected;
  }
  setSelected(selected) {
    this.selected = selected;
  }
  changeText(text) {
    this.text = text;
  }
};

const getDate = () => {
  return new Date().toLocaleDateString('ukr') + ' ' + new Date().toLocaleTimeString('ukr');
};

const add_button = document.getElementById('add_button');

const listOfNotes = document.getElementById('listOfNotes');

const rm_button = document.getElementById('rm_button');

const allNotes = [];

const hashList = {};

const nameOfNote = (note, text) => {
  if (text.substr(0, 25).includes('\n')) {
    const i = text.substr(0, 25).indexOf('\n');
    document.getElementById(note.id).innerHTML = `${text.substr(0, i)}<br>${getDate()}`;
  }
  else document.getElementById(note.id).innerHTML = `${text.substr(0, 25)}<br>${getDate()}`;
  return document.getElementById(note.id).innerHTML;
};

let previous;
let previousText = '';
let currentText = '';

const changeHash = note => {
  const namePart = note.getName().split('<br>')[0].split('');
  namePart.forEach((value, i) => {
    if (value === ' ') namePart[i] = '%20';
  });
  hashList[note.getId()] = namePart.join('') + note.getId().toString().substr(7);
  localStorage.setItem('hashList', JSON.stringify(hashList));
};

const addClick = LI => {
  LI.addEventListener('click', () => {
    allNotes.forEach(note => {
      if (note.id == LI.id) note.setSelected(true);
      else note.setSelected(false);
    });
    location.hash = hashList[LI.id];
    LI.style.backgroundColor = 'red';
    if (previousText !== currentText) {
      const notes = JSON.parse(localStorage.notes);
      for (const value of notes) {
        if (value.id == previous.id) {
          const index = notes.indexOf(value);
          notes.splice(index, 1);
          value.text = currentText;
          value.name = nameOfNote(value, currentText);
          notes.push(value);
          localStorage.removeItem('notes');
          localStorage.setItem('notes', JSON.stringify(notes));
          allNotes.forEach(note => {
            if (note.id == value.id) {
              const text = currentText;
              note.changeText(text);
              note.name = nameOfNote(note, text);
              changeHash(note);
            }
          });
          listOfNotes.insertBefore(previous, listOfNotes.firstChild);
        }
      }
    }
    const notes = JSON.parse(localStorage.notes);
    for (const value of notes) {
      if (value.id == LI.id) {
        document.getElementById('text').value = value.text;
        previousText = currentText;
      }
      else {
        document.getElementById(value.id).style.backgroundColor = 'rgb(188, 210, 223)';
      }
    }
    previous = LI;
  })
};

add_button.addEventListener('click', () => {
  document.getElementById('text').value = '';
  const note = new Note();
  allNotes.push(note);
  const noteLI = document.createElement('li');
  noteLI.appendChild(document.createTextNode(note.getName()));
  changeHash(note);
  location.hash = hashList[note.getId()];
  noteLI.setAttribute('id', note.getId());
  listOfNotes.insertBefore(noteLI, listOfNotes.firstChild);
  const LI = document.getElementById(allNotes[allNotes.length - 1].getId());
  document.getElementById(LI.id).innerHTML = `${note.getName()}<br>${getDate()}`;
  note.name = `${note.getName()}<br>${getDate()}`;
  if (localStorage.getItem('notes')) {
    const notes = JSON.parse(localStorage.notes);
    notes.push(note);
    localStorage.removeItem('notes');
    localStorage.setItem('notes', JSON.stringify(notes));
  }
  else localStorage.setItem('notes', JSON.stringify(allNotes));
  previous = LI;
  LI.style.backgroundColor = 'red';
  note.setSelected(true);
  allNotes.forEach(value => {
    if (value.id !== note.id) value.setSelected(false);
  })
  for (const el of JSON.parse(localStorage.notes)) {
    if (el.id != LI.id) {
      document.getElementById(el.id).style.backgroundColor = 'rgb(188, 210, 223)';
    }
  }
  addClick(LI);
});

const saveNotes = () => {
  const listOfNotes = document.getElementById('listOfNotes');
  const notes = JSON.parse(localStorage.getItem('notes')).reverse();
  for (const note of notes) {
    const noteLI = document.createElement('li');
    noteLI.appendChild(document.createTextNode(note.name));
    noteLI.setAttribute('id', note.id);
    listOfNotes.appendChild(noteLI);
    Object.setPrototypeOf(note, Note.prototype);
    allNotes.push(note);
  }
  for (const note of allNotes) {
    const LI = document.getElementById(note.id);
    const name = `${note.getName().split('<br>')[0]}<br>${note.getName().split('<br>')[1]}`;
    document.getElementById(LI.id).innerHTML = name;
    LI.style.backgroundColor = 'rgb(188, 210, 223)';
    addClick(LI);
  }
  const hashes = JSON.parse(localStorage.getItem('hashList'));
  for (const hash in hashes) {
    hashList[hash] = hashes[hash];
  }
};

rm_button.addEventListener('click', () => {
  location.hash = '';
  for (const note of allNotes) {
    if (note.getSelected()) {
      const index = allNotes.indexOf(note);
      allNotes.splice(index, 1);
      for (let i = 0; i < listOfNotes.childElementCount; i++) {
        const li = listOfNotes.childNodes[i];
        if (li.id == note.id) listOfNotes.removeChild(li);
      }
      const notes = JSON.parse(localStorage.notes);
      for (const value of notes) {
        if (value.id === note.id) {
          const index = notes.indexOf(value);
          notes.splice(index, 1);
          localStorage.removeItem('notes');
          localStorage.setItem('notes', JSON.stringify(notes));
          document.getElementById('text').value = '';
          delete hashList[note.id];
        }
      }
    }
  }
});

function myFunction() {
  currentText = document.getElementById('text').value;
};

window.onhashchange = () => {
  for (const key in hashList) {
    if (`#${hashList[key]}` === location.hash) {
      allNotes.forEach(note => {
        if (note.getId() == previous.id) note.setSelected(false);
        if (note.getId() == key) {
          previous.style.backgroundColor = 'rgb(188, 210, 223)';
          note.setSelected(true);
          document.getElementById(note.getId()).style.backgroundColor = 'red';
          document.getElementById('text').value = note.getText();
          previous = document.getElementById(note.getId());
        }
      })
    }
  }
};

window.addEventListener('load', () => {
  if (localStorage.getItem('notes')) {
    saveNotes();
  }
  for (const key in hashList) {
    if (`#${hashList[key]}` === location.hash) {
      allNotes.forEach(note => {
        if (note.getId() == key) {
          listOfNotes.childNodes.forEach(li => {
            if (li.id == note.getId()) li.innerHTML = note.getName();
          })
          note.setSelected(true);
          document.getElementById(note.getId()).style.backgroundColor = 'red';
          document.getElementById('text').value = note.getText();
          previous = document.getElementById(note.getId());
        }
      })
    }
  }
});
