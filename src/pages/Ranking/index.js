import React, { Component } from 'react';
import PropTypes from 'prop-types';
import md5 from 'crypto-js/md5';
import Button from '../../components/Button';
import trophy from '../../assets/images/trophy.svg';
import './Ranking.scss';

class Ranking extends Component {
  state = {
    ranking: [],
  }

  componentDidMount() {
    const ranking = JSON.parse(localStorage.getItem('ranking'));
    const sortedRanking = ranking?.sort((a, b) => (b.score - a.score));
    this.setState({ ranking: sortedRanking });
  }

  redirect = (path) => {
    const { history } = this.props;
    history.push(path);
  }

  generateProfilePicUrl(gravatarEmail) {
    const gravatarBaseUrl = 'https://www.gravatar.com/avatar/';
    const userEmailToHash = md5(gravatarEmail).toString();
    return gravatarBaseUrl + userEmailToHash;
  }

  render() {
    const { ranking } = this.state;
    return (
      <div className="ranking__container">
        <div className="ranking__container__title__container">
          <h1 data-testid="ranking-title">Ranking</h1>
          <img src={ trophy } alt="trophy" />
        </div>
        <div className="ranking__container__content__container">
          {!!ranking?.length && (
            ranking?.map((user, index) => (
              <div
                className="ranking__container__content__container__user__info"
                key={ user.name + user.score }
              >
                <div className="profile-pic">
                  <img
                    src={ this.generateProfilePicUrl(user.gravatarEmail) }
                    alt={ `${user.name} gravatar` }
                  />
                </div>
                <div className="text-info">
                  <p data-testid={ `player-name-${index}` }>{ user.name }</p>
                  <p
                    data-testid={ `player-score-${index}` }
                  >
                    { `Score: ${user.score}` }
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        <Button
          title="Play again"
          type="button"
          data-testid="btn-go-home"
          onClick={ () => this.redirect('/my-trivia-game') }
        />
      </div>
    );
  }
}

Ranking.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default Ranking;
