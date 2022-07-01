import React, { Component } from 'react';
import PropTypes from 'prop-types';
import md5 from 'crypto-js/md5';
import { connect } from 'react-redux';
import './Header.scss';

class Header extends Component {
  render() {
    const { name, gravatarEmail, score } = this.props;

    const gravatarBaseUrl = 'https://www.gravatar.com/avatar/';
    const userEmailToHash = md5(gravatarEmail).toString();

    return (
      <header className="header__container">
        <aside className="header__container__aside">
          <img
            data-testid="header-profile-picture"
            alt="profile"
            src={ `${gravatarBaseUrl}${userEmailToHash}` }
          />
          <div className="header__container__aside__playerName">
            <span data-testid="header-player-name">{ name }</span>
          </div>
          <div className="header__container__aside__playerScore">
            <p>Player score:</p>
            <span data-testid="header-score">{ score }</span>
          </div>
        </aside>
      </header>
    );
  }
}

const mapStateToProps = (state) => ({
  ...state.player,
});

Header.propTypes = {
  gravatarEmail: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired,
};

export default connect(mapStateToProps, null)(Header);
