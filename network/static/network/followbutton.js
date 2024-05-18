'use strict';
console.log("marico no puede ser")

document.addEventListener('DOMContentLoaded', function() {
  const domContainer = document.querySelector('#follow-button-container');
  const root = ReactDOM.createRoot(domContainer);
  root.render(e(FollowButton, { username: profile_username }));
  loadFollowCounts(profile_username);

});

class FollowButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { following: false };
    this.toggleFollow = this.toggleFollow.bind(this);
  }

  componentDidMount() {
    fetch(`/is_following/${this.props.username}/`)
        .then(response => response.json())
        .then(data => this.setState({ following: data.following }));
  }

  toggleFollow() {
    
    fetch(`/toggle_follow/${this.props.username}/`, { 
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'X-CSRFToken': csrftoken  // Asegúrate de obtener el token CSRF
        }
    })
    .then(response => response.json())
    .then(data => this.setState({ following: data.following }));
    
  }

  render() {
    return e(
      'button',
      { onClick: this.toggleFollow },
      this.state.following ? 'Unfollow' : 'Follow'
    );
  }
}

function loadFollowCounts(username) {
  fetch(`/get_follow_counts/${username}/`)
      .then(response => response.json())
      .then(data => {
          document.querySelector('#followers-count').innerHTML = data.followers;
          document.querySelector('#following-count').innerHTML = data.following;
      });
}

const domContainer = document.querySelector('#follow-button-container');
const root = ReactDOM.createRoot(domContainer);
root.render(e(FollowButton, { username: profile_username }));

