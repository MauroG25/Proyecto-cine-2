console.log("si este es el js");
'use strict';

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
    .then(data =>{
      console.log(data);
    
       this.setState({ liked: data.like, likes: data.likes })
  });
    
  }

  render() {
    return e(
      'button',
      { onClick: this.toggleLike },
      `${this.state.liked ? 'Unlike' : 'Like'} (${this.state.likes})`
    );
  }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("no");
    
    load_mypost(1);
    console.log("no");

  });

console.log("prueba antes de la funcion")
let currentPage = 1;
function load_mypost(pageNumber = 1) {
  console.log("prueba muestra")
  // Show the mailbox and hide other views
  document.querySelector('#my_post-view').style.display = 'block';
  
  

  // Show the mailbox name
  document.querySelector('#my_post-view').innerHTML = `<h3>My Post</h3>`; ///This things should be another views
  console.log("antes va el titulo")
  fetch(`/user_post/${profile_username}?page=${pageNumber}`)

  .then(response => response.json())
  .then (data => {
    console.log(data);
    document.querySelector('#my_post-view').innerHTML = '';
    let likeButtonId = 0;
    const posteos = data;
    if (!posteos) {
      console.error('data.results es undefined');
      return;
    }
    const domContainer = document.querySelector('#like_button_container_' + (likeButtonId - 1));
    posteos.forEach(publi => {
      const element = document.createElement('div');
      element.className = 'publi';
      element.id = `post_${publi.id}`;
      element.innerHTML = `${publi.creator}<br> edit <br> ${publi.description} <br>(${publi.timestamp}) <br> comment `;
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
    document.querySelector('#my_post-view').append(element);
    
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