/**
 *
 * @license
 * Copyright (C) 2016 Joseph Roque
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Joseph Roque
 * @created 2016-10-08
 * @file SplashScreen.js
 * @description Initial entry view for the application. Allows the user to select their preferred language on first run.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  AsyncStorage,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

// Redux imports
import {connect} from 'react-redux';
import {updateConfiguration} from 'actions';

// Types
import type {
  Language,
} from 'types';

// Imports
const Configuration = require('Configuration');
const Constants = require('Constants');
const CoreTranslations: Object = require('../../../assets/json/CoreTranslations.json');
const Preferences = require('Preferences');
const Promise = require('promise');

class SplashScreen extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: {
    navigator: ReactClass < any >,                            // Parent navigator
    onLanguageSelect: (language: Language) => void,           // Changes the user's selected language
    updateConfiguration: (university: Object) => void,        // Updates the app configuration
    updatePreferences: (preferences: Array < any >) => void,  // Updates the user's preferences
  };

  /**
   * Current state of the component.
   */
  state: {
    loading: boolean, // Indicates if the view is still loading
  };

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  /**
   * Checks if a language has been selected, and moves to the next screen if so.
   */
  componentDidMount(): void {
    this._loadPreferences();
  }

  /**
   * Loads the downloaded base configuration and updates the redux store.
   */
  _checkConfiguration(): void {
    Configuration.init()
        .then(() => Configuration.getConfig('/university.json'))
        .then((university: Object) => {
          this.props.updateConfiguration(university);
          this.props.navigator.push({id: 'main'});
        })
        .catch((err: any) => {
          console.log('Assuming configuration is not available.', err);
          this.props.navigator.push({id: 'update'});
        });
  }

  /**
   * Loads the user's saved preferences and updates the redux store.
   */
  _loadPreferences(): void {
    Promise.all([
      Preferences.getTimesAppOpened(AsyncStorage),
      Preferences.getSelectedLanguage(AsyncStorage),
      Preferences.getCurrentSemester(AsyncStorage),
      Preferences.getPrefersWheelchair(AsyncStorage),
      Preferences.getAlwaysSearchAll(AsyncStorage),
      Preferences.getPreferredTimeFormat(AsyncStorage),
    ])
        .then((results: Array < any >) => {
          this.props.updatePreferences(results);
          this._checkConfiguration();
        })
        .catch((err: any) => console.error('Unable to load initial preferences', err));
  }

  /**
   * Handles the event when user selects a language.
   *
   * @param {Language} language the selected language
   */
  _onLanguageSelect(language: Language): void {
    this.props.onLanguageSelect(language);
    this.props.navigator.push({id: 'main'});
  }

  /**
   * Displays two buttons to allow the user to select French or English.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    if (this.state.loading) {
      return (
        <View style={_styles.container} />
      );
    }

    return (
      <View style={_styles.container}>
        <TouchableWithoutFeedback
            style={{flex: 1}}
            onPress={this._onLanguageSelect.bind(this, 'en')}>
          <View style={_styles.englishContainer}>
            <View style={_styles.languageContainer}>
              <Text style={_styles.languageSubtitle}>
                {CoreTranslations.en.continue_in}
              </Text>
              <View style={{padding: 5}}>
                <Text style={_styles.languageTitle}>
                  {CoreTranslations.en.language}
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
            style={{flex: 1}}
            onPress={this._onLanguageSelect.bind(this, 'fr')}>
          <View style={_styles.frenchContainer}>
            <View style={_styles.languageContainer}>
              <Text style={_styles.languageSubtitle}>
                {CoreTranslations.fr.continue_in}
              </Text>
              <View style={{padding: 5}}>
                <Text style={_styles.languageTitle}>
                  {CoreTranslations.fr.language}
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Constants.Colors.primaryBackground,
  },
  englishContainer: {
    flex: 1,
    backgroundColor: Constants.Colors.garnet,
  },
  frenchContainer: {
    flex: 1,
    backgroundColor: Constants.Colors.charcoalGrey,
  },
  languageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageTitle: {
    color: 'white',
    fontSize: Constants.Sizes.Text.Title,
  },
  languageSubtitle: {
    color: 'white',
    fontSize: Constants.Sizes.Text.Subtitle,
  },
});

// Map state to props
const select = (store) => {
  return {
    language: store.config.language,
  };
};

// Map dispatch to props
const actions = (dispatch) => {
  return {
    onLanguageSelect: (language: Language) => dispatch(updateConfiguration({language, firstTime: true})),
    updateConfiguration: (university: Object) => dispatch(updateConfiguration({semesters: university.semesters})),
    updatePreferences: (preferences: Array < any >) => {

      /* eslint-disable no-magic-numbers */
      /* Order of these preferences determined by loadPreferences() order */

      dispatch(updateConfiguration({
        timesAppOpened: preferences[0],
        language: preferences[1],
        currentSemester: preferences[2],
        prefersWheelchair: preferences[3],
        alwaysSearchAll: preferences[4],
        preferredTimeFormat: preferences[5],
      }));

      /* eslint-enable no-magic-numbers */
    },
  };
};

module.exports = connect(select, actions)(SplashScreen);
