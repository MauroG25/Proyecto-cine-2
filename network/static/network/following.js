console.log("si");
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
    
    load_following( 1);
    console.log("no");
    
  });

console.log("prueba antes de la funcion")
let currentPage = 1;
function load_following(pageNumber = 1) {
  console.log("prueba muestra")
  // Show the mailbox and hide other views
  document.querySelector('#following-view').style.display = 'block';
  

  // Show the mailbox name
  document.querySelector('#following-view').innerHTML = `<h3>My Post</h3>`; ///This things should be another views
  console.log("antes va el titulo")
  fetch(`/following_posts?page=${pageNumber}`)
  .then(response => response.json())
  .then (data => {
    const posteos = data;
    document.querySelector('#following-view').innerHTML = '';
    let likeButtonId = 0;
    const domContainer = document.querySelector('#like_button_container_' + (likeButtonId - 1));
    posteos.forEach(publi => {
      const element = document.createElement('div');
      element.className = 'publi';
      const userLink = `<a href="/profile/${publi.creator}">${publi.creator}</a>`;
      element.innerHTML = `${userLink}<br> edit <br> ${publi.description} <br>(${publi.timestamp}) <br> likes <br> comment `;
      
       //like button
        
      const likeButtonContainer = document.createElement('div');
      likeButtonContainer.id = 'like_button_container_' + likeButtonId++;
       
       // Agregar el contenedor al elemento
      element.append(likeButtonContainer);
       
      document.querySelector('#following-view').append(element);
       

       // Renderizar el botón de "like" en el contenedor
      const domContainer = document.querySelector('#like_button_container_' + (likeButtonId - 1));
      document.querySelector('#page-indicator').textContent = 'Página ' + pageNumber;
      currentPage = pageNumber ;
      const root = ReactDOM.createRoot(domContainer);
      root.render(e(LikeButton, {postId: publi.id}));
     
      
    });
  });
}