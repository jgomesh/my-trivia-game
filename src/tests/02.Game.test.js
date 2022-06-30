import React from "react";
import { cleanup, waitFor } from "@testing-library/react";
import { renderWithRouterAndRedux } from './helpers/renderWithRouterAndRedux';
import { screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import App from '../App';
import md5 from 'crypto-js/md5';
import { successQuestionMock, failedQuestionMock } from './mocks/questions';

describe('Testes na página de login', () => {
  beforeEach(cleanup);

  it('01. Verifica se as informações do usuário estão corretamente no Header da página game', async () => {
    const { history } = renderWithRouterAndRedux(<App />);

    const NAME_INPUT = screen.getByTestId("input-player-name");
    const EMAIL_INPUT = screen.getByTestId("input-gravatar-email");
    const BUTTON_LOGIN = screen.getByTestId("btn-play");

    userEvent.type(NAME_INPUT, 'João Otávio');
    userEvent.type(EMAIL_INPUT, 'trybe@gmail.com');

    userEvent.click(BUTTON_LOGIN);

    await waitFor(() => {
      expect(history.location.pathname).toBe('/game')
    });  

    const hashEmail = md5('trybe@gmail.com').toString();
    
    const PLAYER_HEADER_NAME = screen.getByText(/joão otávio/i);
    const PLAYER_HEADER_SCORE = screen.getByText('0');
    const PLAYER_HEADER_IMAGE = screen.getByAltText('profile');

    expect(PLAYER_HEADER_NAME).toBeInTheDocument();
    expect(PLAYER_HEADER_SCORE).toBeInTheDocument();
    expect(PLAYER_HEADER_IMAGE).toBeInTheDocument();
    expect(PLAYER_HEADER_IMAGE).toHaveProperty('src', `https://www.gravatar.com/avatar/${hashEmail}`)
  })

  it('02. Verifica se apenas 5 perguntas são renderizadas na tela', async () => {
    global.fetch = jest.fn(() => Promise.resolve(({
      json: () => Promise.resolve(successQuestionMock)
    })))

    const { history, store } = renderWithRouterAndRedux(<App />)

    const NAME_INPUT = screen.getByTestId("input-player-name");
    const EMAIL_INPUT = screen.getByTestId("input-gravatar-email");
    const BUTTON_LOGIN = screen.getByTestId("btn-play");
    
    userEvent.type(NAME_INPUT, 'João Otávio');
    userEvent.type(EMAIL_INPUT, 'trybe@gmail.com');
    
    userEvent.click(BUTTON_LOGIN);
    
    await waitFor(() => {
      expect(history.location.pathname).toBe('/game')
    });

    expect(store.getState().player.score).toEqual(0);
    expect(store.getState().player.assertions).toEqual(0);

    expect(global.fetch).toHaveBeenCalled();
    expect(global.fetch).toBeCalledWith('https://opentdb.com/api_token.php?command=request')
    
    successQuestionMock.results.forEach((question) => {
      const RIGHT_QUESTION_BUTTON = screen.getByRole('button', { name: question.correct_answer });
      
      expect(screen.getByText(question.question)).toBeInTheDocument();
      expect(RIGHT_QUESTION_BUTTON).toBeInTheDocument();
      
      question.incorrect_answers.forEach((incorrectAnswer) => {
        expect(screen.getByRole('button', { name: incorrectAnswer })).toBeInTheDocument();
      })
      
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
      expect(RIGHT_QUESTION_BUTTON).toHaveProperty('disabled', false);
      
      userEvent.click(RIGHT_QUESTION_BUTTON);

      expect(RIGHT_QUESTION_BUTTON.className).toBe('correct')
      
      question.incorrect_answers.forEach((incorrectAnswer) => {
        expect(screen.getByRole('button', { name: incorrectAnswer }).className).toBe('wrong');
      })

      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
      expect(RIGHT_QUESTION_BUTTON.disabled).toBeTruthy();

      userEvent.click(screen.getByTestId('btn-next'));
    })

    expect(store.getState().player.score).toEqual(320);
    expect(store.getState().player.assertions).toEqual(5);

    expect(screen.getAllByText('320')[0]).toBeInTheDocument();

    await waitFor(() => {
      expect(history.location.pathname).toBe('/feedback')
    });
  })

  it('03.Testa se o timer funciona corretamente', async () => {
    global.fetch = jest.fn(() => Promise.resolve(({
      json: () => Promise.resolve(successQuestionMock)
    })))

    const { history } = renderWithRouterAndRedux(<App />)

    const NAME_INPUT = screen.getByTestId("input-player-name");
    const EMAIL_INPUT = screen.getByTestId("input-gravatar-email");
    const BUTTON_LOGIN = screen.getByTestId("btn-play");
    
    userEvent.type(NAME_INPUT, 'João Otávio');
    userEvent.type(EMAIL_INPUT, 'trybe@gmail.com');
    
    userEvent.click(BUTTON_LOGIN);
    
    await waitFor(() => {
      expect(history.location.pathname).toBe('/game')
    });

    expect(screen.getByRole('heading', { level: 1, name: '30' })).toBeInTheDocument();

    setTimeout(() => {
      expect(screen.getByRole('heading', { level: 1, name: '0' })).toBeInTheDocument();

      const RIGHT_QUESTION_BUTTON = screen.getByRole('button', {
        name: successQuestionMock.results[1].correct_answer
      });

      expect(RIGHT_QUESTION_BUTTON.disabled).toBeTruthy();

      successQuestionMock.results[1].incorrect_answers.forEach((incorrectAnswer) => {
        const WRONG_BUTTON = screen.getByRole('button', { name: incorrectAnswer });
        expect(WRONG_BUTTON).toBeInTheDocument();
        expect(WRONG_BUTTON.disabled).toBeTruthy();
      })

      const NEXT_BUTTON = screen.getByRole('button', { name: /next/i });
      expect(NEXT_BUTTON).toBeInTheDocument();
      expect(NEXT_BUTTON.disabled).toBeFalsy();

      userEvent.click(NEXT_BUTTON);

      expect(screen.getByRole('heading', { level: 1, name: '30' })).toBeInTheDocument();
    }, 30000)

    expect(screen.queryByRole('button', { name: /next/i })).toBeFalsy();
  })

  it('04.Testa se o token inválido redireciona para a página de login', async () => {
    global.fetch = jest.fn(() => Promise.resolve(({
      json: () => Promise.resolve(failedQuestionMock)
    })))

    const { history } = renderWithRouterAndRedux(<App />);

    const NAME_INPUT = screen.getByTestId("input-player-name");
    const EMAIL_INPUT = screen.getByTestId("input-gravatar-email");
    const BUTTON_LOGIN = screen.getByTestId("btn-play");
    
    userEvent.type(NAME_INPUT, 'João Otávio');
    userEvent.type(EMAIL_INPUT, 'trybe@gmail.com');
    
    userEvent.click(BUTTON_LOGIN);

    await waitFor(() => {
      expect(history.location.pathname).toBe('/')
    });
  })

  it('05.Testa se o token do usuário é armazenado no localStorage', async () => {
    global.fetch = jest.fn(() => Promise.resolve(({
      json: () => Promise.resolve(successQuestionMock)
    })))

    jest.spyOn(Object.getPrototypeOf(localStorage), "getItem");
    jest.spyOn(Object.getPrototypeOf(localStorage), "setItem");

    const { history } = renderWithRouterAndRedux(<App />);

    const NAME_INPUT = screen.getByTestId("input-player-name");
    const EMAIL_INPUT = screen.getByTestId("input-gravatar-email");
    const BUTTON_LOGIN = screen.getByTestId("btn-play");
    
    userEvent.type(NAME_INPUT, 'João Otávio');
    userEvent.type(EMAIL_INPUT, 'trybe@gmail.com');
    
    userEvent.click(BUTTON_LOGIN);
    
    await waitFor(() => {
      expect(history.location.pathname).toBe('/game')
    });

    expect(localStorage.setItem).toHaveBeenCalled();
    expect(localStorage.getItem).toHaveBeenCalled();
  })
  it('06.Teste se o ranking é salvo no localStorage', async () => {
    // SETANDO O LOCAL STORAGE INICIAL
    const token = 'a9c201e5dce6288034315a596cf296525a305f86b3ba6f5004d90fbb8575be47';
    const fakeUserResponse = {token: token, ranking: [{name: 'João Otávio', score: 320, assertions: 5, gravatarEmail: 'trybe@gmail.com'}]};

    global.fetch = jest.fn(() => Promise.resolve(({
      json: () => Promise.resolve(successQuestionMock)
    })))

    jest.spyOn(window, 'fetch').mockImplementationOnce(() => {
      return Promise.resolve({
        json: () => Promise.resolve(fakeUserResponse),
      })
    })
  
    const { history } = renderWithRouterAndRedux(<App />);

    const NAME_INPUT = screen.getByTestId("input-player-name");
    const EMAIL_INPUT = screen.getByTestId("input-gravatar-email");
    const BUTTON_LOGIN = screen.getByTestId("btn-play");
    
    userEvent.type(NAME_INPUT, 'João Otávio');
    userEvent.type(EMAIL_INPUT, 'trybe@gmail.com');
    
    userEvent.click(BUTTON_LOGIN);

    await waitFor(() => {
      expect(history.location.pathname).toBe('/')
    });
    // CLICAR NAS QUESTOES ATE REDIRECIONAR A PAG
    successQuestionMock.results.forEach((question) => {
      const RIGHT_QUESTION_BUTTON = screen.getByRole('button', { name: question.correct_answer });
      
      expect(screen.getByText(question.question)).toBeInTheDocument();
      expect(RIGHT_QUESTION_BUTTON).toBeInTheDocument();
      
      question.incorrect_answers.forEach((incorrectAnswer) => {
        expect(screen.getByRole('button', { name: incorrectAnswer })).toBeInTheDocument();
      })
      
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
      expect(RIGHT_QUESTION_BUTTON).toHaveProperty('disabled', false);
      
      userEvent.click(RIGHT_QUESTION_BUTTON);

      expect(RIGHT_QUESTION_BUTTON.className).toBe('correct')
      
      question.incorrect_answers.forEach((incorrectAnswer) => {
        expect(screen.getByRole('button', { name: incorrectAnswer }).className).toBe('wrong');
      })

      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
      expect(RIGHT_QUESTION_BUTTON.disabled).toBeTruthy();

      userEvent.click(screen.getByTestId('btn-next'));
    })
    // VERIFICA SE A STORE ESTA COMO DEVERIA NO FINAL
    expect(JSON.parse(window.localStorage.ranking)).toEqual(
      [{
        name: 'João Otávio',
        score: 320, assertions: 5,
        gravatarEmail: 'trybe@gmail.com',
      }, {
        name: 'João Otávio',
        score: 320, assertions: 5,
        gravatarEmail: 'trybe@gmail.com',
      }]
    )
  })

  it('07. Testa se ao responder 5 perguntas erradas, o score permanece 0', async () => {
      global.fetch = jest.fn(() => Promise.resolve(({
        json: () => Promise.resolve(successQuestionMock)
      })))
  
      const { history, store } = renderWithRouterAndRedux(<App />)
  
      const NAME_INPUT = screen.getByTestId("input-player-name");
      const EMAIL_INPUT = screen.getByTestId("input-gravatar-email");
      const BUTTON_LOGIN = screen.getByTestId("btn-play");
      
      userEvent.type(NAME_INPUT, 'João Otávio');
      userEvent.type(EMAIL_INPUT, 'trybe@gmail.com');
      
      userEvent.click(BUTTON_LOGIN);
      
      await waitFor(() => {
        expect(history.location.pathname).toBe('/game')
      });
  
      expect(store.getState().player.score).toEqual(0);
      expect(store.getState().player.assertions).toEqual(0);
      
      successQuestionMock.results.forEach((question) => {
        question.incorrect_answers.forEach((incorrectAnswer) => {
          expect(screen.getByRole('button', { name: incorrectAnswer })).toBeInTheDocument();
          userEvent.click(screen.getByRole('button', { name: incorrectAnswer }));
        })
        userEvent.click(screen.getByRole('button', { name: /next/i }));
      })
  
      expect(store.getState().player.score).toEqual(0);
      expect(store.getState().player.assertions).toEqual(0);
  
      expect(screen.getAllByText('0')[0]).toBeInTheDocument();
  })

  it('08.Testa se as questões estão corretamente desabilitadas', async () => {
    global.fetch = jest.fn(() => Promise.resolve(({
      json: () => Promise.resolve(successQuestionMock)
    })))

    const { history } = renderWithRouterAndRedux(<App />)

    const NAME_INPUT = screen.getByTestId("input-player-name");
    const EMAIL_INPUT = screen.getByTestId("input-gravatar-email");
    const BUTTON_LOGIN = screen.getByTestId("btn-play");
    
    userEvent.type(NAME_INPUT, 'João Otávio');
    userEvent.type(EMAIL_INPUT, 'trybe@gmail.com');
    
    userEvent.click(BUTTON_LOGIN);
    
    await waitFor(() => {
      expect(history.location.pathname).toBe('/game')
    });

    expect(screen.getByRole('heading', { level: 1, name: '30' })).toBeInTheDocument();

    successQuestionMock.results.forEach((question) => {
      [...question.incorrect_answers, question.correct_answer].forEach((answer) => {
        const ANSWER_BUTTON = screen.getByRole('button', { name: answer });
        expect(ANSWER_BUTTON).toBeInTheDocument();
        expect(ANSWER_BUTTON.disabled).toBeFalsy();
      })
      userEvent.click(screen.getByRole('button', { name: question.correct_answer }));
      userEvent.click(screen.getByRole('button', { name: /next/i }));
    });
  })

  it('09. Testa se o botão next aparece após o tempo acabar', async () => {
    global.fetch = jest.fn(() => Promise.resolve(({
      json: () => Promise.resolve(successQuestionMock)
    })))

    const { history } = renderWithRouterAndRedux(<App />)

    const NAME_INPUT = screen.getByTestId("input-player-name");
    const EMAIL_INPUT = screen.getByTestId("input-gravatar-email");
    const BUTTON_LOGIN = screen.getByTestId("btn-play");
    
    userEvent.type(NAME_INPUT, 'João Otávio');
    userEvent.type(EMAIL_INPUT, 'trybe@gmail.com');
    
    userEvent.click(BUTTON_LOGIN);
    
    await waitFor(() => {
      expect(history.location.pathname).toBe('/game')
    });

    expect(screen.getByRole('heading', { level: 1, name: '30' })).toBeInTheDocument();

    setTimeout(() => {
      expect(screen.queryByRole('button', { name: /next/i })).toBeInTheDocument();
    }, 30000)
  })
})
