import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Linking, SectionList, StyleSheet, TouchableOpacity } from 'react-native';

import { View, Container, KEY_COLOR, Text } from '../components/Themed';
import { getColors } from '../hooks/colorSchemeContext';

export default function HelpfulLinksScreen({ openMenu }) {
  const items = [
    {
      title: "The Basics",
      data: [
        {
          text: "nobles.edu",
          link: "https://nobles.edu"
        },
        {
          text: "Veracross",
          link: "https://accounts.veracross.com/nobles/portals/login"
        }
      ]
    },
    {
      title: "The Nobleman",
      data: [
        {
          text: "Website",
          link: "https://thenoblemanonline.com"
        },
        {
          text: "YouTube",
          link: "https://www.youtube.com/channel/UC7y9Kdva4ouKAZqGGYIZe9A"
        }
      ]
    },
    {
      title: "Library",
      data: [
        {
          text: "Reserve library meeting rooms",
          link: "https://nobleslib.skedda.com/booking"
        },
        {
          text: "Download library eBooks and audiobooks",
          link: "https://soraapp.com/welcome/redirect/gbclama"
        }
      ]
    },
    {
      title: "Community Service",
      data: [
        {
          text: "Independent Service Evaluation Form",
          link: "https://docs.google.com/forms/u/1/d/e/1FAIpQLSdXveMm8xl2zgTcCeS_aVEVtn3VBDxd-IfbC2cuUkYlvo0ymg/viewform"
        }
      ]
    },
    {
      title: "Other",
      data: [
        {
          text: "Homework Answers",
          link: "https://www.youtube.com/watch?v=xvFZjo5PgG0"
        }
      ]
    },
  ]

  return (
    <Container title="HELPFUL LINKS" menuButton={{
      icon: "bars",
      action: openMenu
    }}>
      <SectionList
        sections={items}
        keyExtractor={item => JSON.stringify(item)}
        renderItem={LinkItem}
        renderSectionHeader={HeaderItem}
        renderSectionFooter={() => (<View style={{paddingBottom: 10}} />)}
        scrollEnabled={false}
      />
    </Container>
  );
}

function HeaderItem({ section }) {
  return (
    <View style={{
      borderBottomWidth: 2,
      borderColor: KEY_COLOR,
      padding: 5
    }}>
      <Text style={{
        textAlign: "center",
        fontSize: 22
      }}>{ section.title }</Text>
    </View>
  );
}

function LinkItem({ item }) {
  const {fgColor,bgColor} = getColors();

  return (
    <TouchableOpacity style={[styles.row,{
      paddingLeft: 5,
      paddingRight: 5,
      paddingTop: 3,
      paddingBottom: 3
    }]} onPress={() => Linking.openURL(item.link)}>
      <Text style={{
        flex: 10
      }}>{ item.text }</Text>
      <View style={{
        flex: 1,
        alignItems: "flex-end",
        justifyContent: "center"
      }}>
        <FontAwesome name="external-link" size={20} color={fgColor} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%"
  }
});