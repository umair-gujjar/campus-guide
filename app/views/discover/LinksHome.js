/*************************************************************************
 *
 * @license
 *
 * Copyright 2016 Joseph Roque
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
 *************************************************************************
 *
 * @file
 * LinksHome.js
 *
 * @description
 * Presents a list of defined, useful links for the user regarding the
 * university.
 *
 * @author
 * Joseph Roque
 *
 *************************************************************************
 *
 * @external
 * @flow
 *
 ************************************************************************/
'use strict';

// React Native imports
const React = require('react-native');
const {
  Component,
  Image,
  ListView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} = React;

// Imports
const Constants = require('../../Constants');
const LanguageUtils = require('../../util/LanguageUtils');
const Preferences = require('../../util/Preferences');
const Styles = require('../../Styles');

class LinksHome extends Component {

  /**
   * Properties which the parent component should make available to this
   * component.
   */
  static propTypes = {
    showLinkCategory: React.PropTypes.func.isRequired,
  };

  /**
   * Pass props and declares initial state.
   *
   * @param props properties passed from container to this component.
   */
  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      loaded: false,
    };

    // Explicitly binding 'this' to all methods that need it
    this._loadLinkCategories = this._loadLinkCategories.bind(this);
    this._renderRow = this._renderRow.bind(this);
  };

  /**
   * Retrieves the set of categories that the various useful links in the app
   * belong to.
   */
  _loadLinkCategories() {
    let linkCategories = require('../../../assets/static/js/UsefulLinks');

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(linkCategories),
      loaded: true,
    });
  }

  /**
   * Displays a single category name and an image which represents it.
   *
   * @param category object with properties describing the category.
   * @return an image and text describing the category.
   */
  _renderRow(category) {
    return (
      <TouchableOpacity onPress={() => this.props.showLinkCategory(category)} style={_styles.categoryContainer}>
        <Image
            resizeMode={'cover'}
            source={category.image}
            style={_styles.categoryImage} />
        <View style={_styles.categoryTextContainer}>
          <Text style={[_styles.categoryText, Styles.titleText]}>
            {LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), category)}
          </Text>
        </View>
      </TouchableOpacity>
    )
  };

  /**
   * Loads the links to display.
   */
  componentDidMount() {
    if (!this.state.loaded) {
      this._loadLinkCategories();
    }
  };

  /**
   * Renders a list of images and titles for the user to select, opening a
   * screen with a list of useful links.
   *
   * @return the hierarchy of views to render.
   */
  render() {
    if (!this.state.loaded) {
      return (
        <View style={_styles.container} />
      );
    } else {
      return (
        <View style={_styles.container}>
          <ListView
              dataSource={this.state.dataSource}
              renderRow={this._renderRow} />
        </View>
      )
    }
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.darkGrey,
  },
  categoryContainer: {
    height: 175,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  categoryImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: null,
    height: null,
  },
  categoryTextContainer: {
    backgroundColor: Constants.Colors.defaultComponentBackgroundColor,
  },
  categoryText: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    color: Constants.Colors.primaryWhiteText,
  },
});

// Expose component to app
module.exports = LinksHome;