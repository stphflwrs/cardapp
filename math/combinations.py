#!/usr/bin/python

numTempura = 14			# A
numSashimi = 14			# B
numDumpling = 14		# C
num2Maki = 12			# D
num3Maki = 8			# E
num1Maki = 6			# F
numSalmonNigiri = 10	# G
numSquidNigiri = 5		# H
numEggNigiri = 5		# I
numPudding = 10			# J
numWasabi = 6			# K
numChopsticks = 4		# L

def buildDeck():
	deck = []
	for index in range(numTempura):
		deck.append('A')
	for index in range(numSashimi):
		deck.append('B')
	for index in range(numDumpling):
		deck.append('C')
	for index in range(num2Maki):
		deck.append('D')
	for index in range(num3Maki):
		deck.append('E')
	for index in range(num1Maki):
		deck.append('F')
	for index in range(numSalmonNigiri):
		deck.append('G')
	for index in range(numSquidNigiri):
		deck.append('H')
	for index in range(numEggNigiri):
		deck.append('I')
	for index in range(numPudding):
		deck.append('J')
	for index in range(numWasabi):
		deck.append('K')
	for index in range(numChopsticks):
		deck.append('L')

	return deck

myDeck = buildDeck()
# print(len(myDeck))

def generateHands(deck, hands, size):
	if size == 0:
		return hands
	elif len(hands) == 0:
		for card in deck:
			hand = ""
			hand += card
			hands.add(hand)
		size -= 1
		return generateHands(deck, hands, size)
	else:
		newHands = set()
		for hand in hands:
			tempDeck = list(deck)
			for card in hand:
				tempDeck.remove(card)
			for card in tempDeck:
				tempHand = ""
				tempHand += card
				tempHand += hand
				newHands.add(''.join(sorted(tempHand)))
		return generateHands(deck, newHands, size - 1)


num10Hands = len(generateHands(myDeck, set(), 10))
num9Hands = len(generateHands(myDeck, set(), 9))
num8Hands = len(generateHands(myDeck, set(), 8))
num7Hands = len(generateHands(myDeck, set(), 7))
num6Hands = len(generateHands(myDeck, set(), 6))
num5Hands = len(generateHands(myDeck, set(), 5))
num4Hands = len(generateHands(myDeck, set(), 4))
num3Hands = len(generateHands(myDeck, set(), 3))
num2Hands = len(generateHands(myDeck, set(), 2))
num1Hands = len(generateHands(myDeck, set(), 1))

def generatePlays(deck, plays, size):
	if size == 0:
		return plays
	elif len(plays) == 0:
		for card in deck:
			play = ""
			play += card
			plays.add(play)
		return generatePlays(deck, plays, size - 1)
	else:
		newPlays = set()
		for play in plays:
			tempDeck = list(deck)
			for card in play:
				tempDeck.remove(card)
			for card in tempDeck:
				tempPlay = ""
				tempPlay += play
				tempPlay += card

				# Look for wasabi and nigiri in a play
				noTriplePlay = ""
				onlyTriples = ""
				for cardIndex in range(len(tempPlay)):
					if tempPlay[cardIndex] == 'K' or tempPlay[cardIndex] == 'G' or tempPlay[cardIndex] == 'H' or tempPlay[cardIndex] == 'I':
						onlyTriples += tempPlay[cardIndex]
					else:
						noTriplePlay += tempPlay[cardIndex]

				if not onlyTriples.find('K') == -1:
					# # Remove nigiri that come before a wasabi
					# for cardIndex in range(len(onlyTriples)):
					# 	if onlyTriples[cardIndex] == 'K':
					# 		break
					# 	else:
					# 		noTriplePlay += onlyTriples[cardIndex]
					# 		onlyTriples = onlyTriples[1:]

					# Remove excess nigiri
					toRemove = []
					numWasabi = 0
					for cardIndex in range(len(onlyTriples)):
						if onlyTriples[cardIndex] == 'K':
							numWasabi += 1
						elif numWasabi == 0:
							# noTriplePlay += onlyTriples[cardIndex]
							# onlyTriples = onlyTriples[:cardIndex] + onlyTriples[cardIndex + 1:]
							toRemove.append(cardIndex)
						else:
							numWasabi -= 1

					for i in range(len(toRemove)):
						toRemove[i] -= i
						noTriplePlay += onlyTriples[toRemove[i]]
						onlyTriples = onlyTriples[:toRemove[i]] + onlyTriples[toRemove[i] + 1:]

					noTriplePlay = ''.join(sorted(noTriplePlay))
					tempPlay = noTriplePlay + onlyTriples
					newPlays.add(tempPlay)
				else:
					newPlays.add(''.join(sorted(tempPlay)))

				# wasabiIndexes = []
				# squidIndexes = []
				# salmonIndexes = []
				# eggIndexes = []

				# nigiriIndexes = dict()
				# for cardIndex in range(len(tempPlay)):
				# 	if tempPlay[cardIndex] == 'K':
				# 		# print("Wasabi found")
				# 		wasabiIndexes.append(cardIndex)
				# 	elif tempPlay[cardIndex] == 'G':
				# 		# squidIndexes.append(cardIndex)

				# 	elif tempPlay[cardIndex] == 'H':
				# 		salmonIndexes.append(cardIndex)
				# 	elif tempPlay[cardIndex] == 'I':
				# 		eggIndexes.append(cardIndex)

				# if len(wasabiIndexes) > 0 and len(nigiriIndexes) > 0:
				# 	if (wasabiIndexes[0] < nigiriIndexes[len(nigiriIndexes) - 1]):
				# 		print("Unique wasabi-nigiri hand found, don't sort")
				# 		newPlays.add(tempPlay)
				# 	else:
				# 		newPlays.add(''.join(sorted(tempPlay)))
				# else:
				# 	newPlays.add(''.join(sorted(tempPlay)))
		return generatePlays(deck, newPlays, size - 1)

num10Plays = len(generatePlays(myDeck, set(), 10))
num9Plays = len(generatePlays(myDeck, set(), 9))
num8Plays = len(generatePlays(myDeck, set(), 8))
num7Plays = len(generatePlays(myDeck, set(), 7))
num6Plays = len(generatePlays(myDeck, set(), 6))
num5Plays = len(generatePlays(myDeck, set(), 5))
num4Plays = len(generatePlays(myDeck, set(), 4))
num3Plays = len(generatePlays(myDeck, set(), 3))
num2Plays = len(generatePlays(myDeck, set(), 2))
num1Plays = len(generatePlays(myDeck, set(), 1))

# print("Number of unique hands...")
# print(num10Hands + num9Hands + num8Hands + num7Hands + num6Hands + num5Hands + num4Hands + num3Hands + num2Hands + num1Hands)
print("Hands of 10: " + str(num10Hands))
print("Hands of 09: " + str(num9Hands))
print("Hands of 08: " + str(num8Hands))
print("Hands of 07: " + str(num7Hands))
print("Hands of 06: " + str(num6Hands))
print("Hands of 05: " + str(num5Hands))
print("Hands of 04: " + str(num4Hands))
print("Hands of 03: " + str(num3Hands))
print("Hands of 02: " + str(num2Hands))
print("Hands of 01: " + str(num1Hands))


print("Number of unique plays...")
# print(num10Plays + num9Plays + num8Plays + num7Plays + num6Plays + num5Plays + num4Plays + num3Plays + num2Plays + num1Plays)
print("Plays of 10: " + str(num10Plays))
print("Plays of 09: " + str(num9Plays))
print("Plays of 08: " + str(num8Plays))
print("Plays of 07: " + str(num7Plays))
print("Plays of 06: " + str(num6Plays))
print("Plays of 05: " + str(num5Plays))
print("Plays of 04: " + str(num4Plays))
print("Plays of 03: " + str(num3Plays))
print("Plays of 02: " + str(num2Plays))
print("Plays of 01: " + str(num1Plays))

# print(generatePlays(myDeck, set(), 3))