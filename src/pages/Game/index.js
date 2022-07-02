import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import fetchGameQuestions from '../../services/fetchGameQuestions';
import sortQuestions from '../../utils/sortQuestions';
import Question from '../../components/Question';
import Header from '../../components/Header';
import Button from '../../components/Button';
import { sendUserGameInfo } from '../../redux/actions/actions';
import clearTimer from '../../utils/clearTimer';
import clock from '../../assets/images/clock.svg';
import clockDanger from '../../assets/images/clock-danger.svg';
import './Game.scss';

class Game extends Component {
  state = {
    questions: [],
    index: 0,
    answered: false,
    timer: 30,
  }

  async componentDidMount() {
    const { history } = this.props;

    const { results } = await fetchGameQuestions();

    if (!results.length) {
      localStorage.removeItem('token');
      history.push('/');
    }

    const resultsSorted = results.map(sortQuestions);

    this.setState((prevState) => ({
      ...prevState,
      questions: [...resultsSorted],
    }));

    this.timerCounter();
  }

  componentWillUnmount() {
    const { intervalId } = this.state;
    clearTimer.clearTimer(intervalId);
  }

  timerCounter = () => {
    const delayInMiliseconds = 1000;

    const intervalId = setInterval(() => {
      const { timer } = this.state;
      if (timer === 0) {
        this.setState({ answered: true });
        return clearTimer.clearTimer(intervalId);
      }

      this.setState((prevState) => ({
        ...prevState,
        timer: prevState.timer - 1,
        intervalId,
      }));
    }, delayInMiliseconds);
  }

  increment = () => {
    const maxLength = 4;

    const {
      history,
      player,
    } = this.props;

    const { intervalId, index } = this.state;

    clearTimer.clearTimer(intervalId);

    this.setState((prevState) => ({
      ...prevState,
      index: prevState.index < maxLength && prevState.index + 1,
      answered: false,
      timer: 30,
    }), () => this.timerCounter());

    if (index === maxLength) {
      history.push('/feedback');

      if (!localStorage.getItem('ranking')) {
        localStorage.setItem('ranking', JSON.stringify([player]));
      } else {
        const ranking = JSON.parse(localStorage.getItem('ranking'));
        localStorage.setItem('ranking', JSON.stringify([...ranking, player]));
      }
    }
  };

  setPoints = (points, assertions) => {
    const { sendGameInfo } = this.props;
    sendGameInfo(points, assertions);
  }

  handleAnswerClick = ({ points, assertions }) => {
    this.setState({
      answered: true,
    });

    this.setPoints(points, assertions);
  }

  render() {
    const { index, questions, answered, timer } = this.state;
    const dangerTime = 10;

    return (
      <div className="game__container">
        <Header />

        <main className="game__container__question__container">

          <div className="game__container__timer__container">
            <img src={ timer <= dangerTime ? clockDanger : clock } alt="clock icon" />
            <h1 className={ timer <= dangerTime ? 'danger' : '' }>{ timer }</h1>
          </div>

          { !!questions.length && (
            <Question
              question={ questions[index] }
              answered={ answered }
              handleClick={ this.handleAnswerClick }
              isDisabled={ !timer || answered }
              timer={ timer }
            />
          )}

          {
            answered && (
              <Button
                className="game__container__nextAnswerButton"
                type="button"
                title="Next"
                testId="btn-next"
                onClick={ this.increment }
              />
            )
          }
        </main>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  sendGameInfo: (score, assertions) => dispatch(sendUserGameInfo(score, assertions)),
});

const mapStateToProps = (state) => ({
  ...state,
});

Game.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  player: PropTypes.shape({
    name: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
    assertions: PropTypes.number.isRequired,
    gravatarEmail: PropTypes.string.isRequired,
  }).isRequired,
  sendGameInfo: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);
