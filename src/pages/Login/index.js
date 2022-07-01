import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import fetchToken from '../../services/fetchToken';
import isEmailValid from '../../utils/isEmailValid';
import { sendUserInfo, resetPoints } from '../../redux/actions/actions';
import './Login.scss';

class Login extends React.Component {
  state = {
    name: '',
    gravatarEmail: '',
  }

  handleChange = ({ target }) => {
    const { value, name } = target;
    this.setState({ [name]: value });
  }

  isFormValid = () => {
    const { name, gravatarEmail } = this.state;
    return (name && isEmailValid(gravatarEmail));
  }

  handleUserLogin = async () => {
    const { history, dispatchUserInfo, resetUserPoints } = this.props;
    resetUserPoints();
    dispatchUserInfo(this.state);
    await fetchToken();
    history.push('/game');
  }

  goToSettings = () => {
    const { history } = this.props;
    history.push('/settings');
  }

  render() {
    const { name, gravatarEmail } = this.state;
    return (
      <main className="login__container">
        <form className="login__container__form" autoComplete="off">
          <div className="login__container__form__logo" />
          <input
            className="login__container__form__input"
            placeholder="Enter your name..."
            type="text"
            data-testid="input-player-name"
            value={ name }
            name="name"
            id="name"
            onChange={ this.handleChange }
          />

          <input
            className="login__container__form__input"
            type="email"
            name="gravatarEmail"
            id="gravatarEmail"
            placeholder="Enter your e-mail..."
            value={ gravatarEmail }
            onChange={ this.handleChange }
            data-testid="input-gravatar-email"
          />

          <button
            className="login__container__form__btn"
            type="button"
            data-testid="btn-play"
            onClick={ this.handleUserLogin }
            disabled={ !this.isFormValid() }
          >
            PLAY
          </button>
          <button
            id="settings_btn"
            type="button"
            data-testid="btn-settings"
            onClick={ this.goToSettings }
          >
            Settings
          </button>
        </form>
      </main>

    );
  }
}

Login.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  dispatchUserInfo: PropTypes.func.isRequired,
  resetUserPoints: PropTypes.func.isRequired,
};
const mapDispatchToProps = (dispatch) => ({
  dispatchUserInfo: (info) => dispatch(sendUserInfo(info)),
  resetUserPoints: () => dispatch(resetPoints()),
});

export default connect(null, mapDispatchToProps)(Login);
