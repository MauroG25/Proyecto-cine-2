'use strict';

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}
const csrftoken = getCookie('csrftoken');


const e = React.createElement;

class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false, likes: 0 };
    this.toggleLike = this.toggleLike.bind(this);
  }

  componentDidMount() {
    fetch(`/is_liked/${this.props.postId}/`)
        .then(response => response.json())
        .then(data => this.setState({ liked: data.liked, likes: data.likes}));
  }

  toggleLike() {
    fetch(`/toggle_like/${this.props.postId}/`, { 
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'X-CSRFToken': csrftoken  // Asegúrate de obtener el token CSRF
        }
    })
    .then(response => response.json())
    .then(data => this.setState({ liked: data.like, likes: data.likes }));
    
  }

  render() {
    return e(
      'button',
      { onClick: this.toggleLike },
      `${this.state.liked ? 'Unlike' : 'Like'} (${this.state.likes})`
    );
  }
}

console.log("si");

document.addEventListener('DOMContentLoaded', function() {
    console.log("no");
    compose_post();
    load_post('index', 1);;
    console.log("no");

  
  });



function compose_post() {
  console.log("compose_post function called");  // New console.log statement
  // Show compose view and hide other views
  document.querySelector('#allpost-view').style.display = 'block';
  document.querySelector('#compose_post-view').style.display = 'block';
    document.querySelector('#compose-form').onsubmit = function() {
      console.log("Form submitted");  // New console.log statement
      let description = document.querySelector('#compose-description').value;
      let csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

      let formData = new FormData();
      formData.append('description', description);

      fetch('/createpost', {
          method: 'POST',
          body: formData,
          headers: { 'X-CSRFToken': csrfToken }
      })
      .then(response => {
        console.log("Fetch response received");  // New console.log statement
        console.log(response);  // New console.log statement
        return response.json();
      })
      .then(result => {
          console.log("Fetch response processed");  // New console.log statement
          console.log(result);  // New console.log statement

          if (result.message) {
              alert(result.message);

              load_post("index");
          } else if (result.error) {
              alert(result.error);
          }
      });
      document.querySelector('#compose-description').value = '';
      return false;
      };
  // Clear out composition fields
  
}
console.log("prueba antes de la funcion")
let currentPage = 1;
function load_post(allpost, pageNumber = 1) {
  console.log("prueba muestra")
  // Show the mailbox and hide other views
  document.querySelector('#allpost-view').style.display = 'block';
  document.querySelector('#compose_post-view').style.display = 'block';

  // Show the mailbox name
  document.querySelector('#allpost-view').innerHTML = `<h3>All Post</h3>`;
  console.log("antes va el titulo")
  fetch(`/createpost/${allpost}?page=${pageNumber}`)
  .then(response => response.json())
  .then (data => {
    const posteos =data;
    document.querySelector('#allpost-view').innerHTML = '';
    let likeButtonId = 0;
    const domContainer = document.querySelector('#like_button_container_' + (likeButtonId - 1));
    posteos.forEach(publi => {
      const element = document.createElement('div');
      element.className = 'publi';
      element.id = `post_${publi.id}`;
      const userLink = `<a href="/profile/${publi.creator}">${publi.creator}</a>`;
      element.innerHTML = `${userLink}<br> ${publi.description} <br>(${publi.timestamp}) <br> comment `;
      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.onclick = function() {
        editPost(publi.id);
      };
      element.append(editButton);
      
      //like button
        
    const likeButtonContainer = document.createElement('div');
    likeButtonContainer.id = 'like_button_container_' + likeButtonId++;
    
    // Agregar el contenedor al elemento
    element.append(likeButtonContainer);
    
    // Agregar el elemento a la vista
    document.querySelector('#allpost-view').append(element);
    
    // Seleccionar el contenedor del botón de "like"
    const domContainer = document.querySelector('#like_button_container_' + (likeButtonId - 1));
    document.querySelector('#page-indicator').textContent = 'Página ' + pageNumber;
    currentPage = pageNumber ;
    // Renderizar el botón de "like" en el contenedor
    const root = ReactDOM.createRoot(domContainer);
    root.render(e(LikeButton, {postId: publi.id}));

    });
  });
}
function editPost(publi_id) {
  const postElement = document.getElementById(`post_${publi_id}`);
  if (!postElement) {
    console.error(`No se encontró el elemento con el ID post_${publi_id}`);
    return;
  }
  const postContent = postElement.textContent;
  postElement.innerHTML = '';
  const textarea = document.createElement('textarea');
  textarea.value = postContent;
  postElement.append(textarea);
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save';
  saveButton.onclick = function() {
    savePost(publi_id, textarea.value);
  };
  postElement.append(saveButton);
}
function savePost(publi_id, newContent) {
  fetch(`/update_post/${publi_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      content: newContent
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    const postElement = document.getElementById(`post_${publi_id}`);
    postElement.innerHTML = '';
    postElement.textContent = newContent;
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = function() {
      editPost(publi_id);
    };
    postElement.append(editButton);
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });
}