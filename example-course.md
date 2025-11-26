# Thermodynamique - Les gaz parfaits

## Introduction

Un gaz parfait est un modèle théorique de gaz dans lequel les particules n'interagissent pas entre elles, sauf lors de collisions élastiques. Ce modèle simplifié permet d'établir des relations mathématiques simples entre pression, volume et température.

## Équation d'état des gaz parfaits

L'équation d'état des gaz parfaits, également appelée loi des gaz parfaits, s'écrit :

**PV = nRT**

Où :
- P est la pression (en Pa)
- V est le volume (en m³)
- n est la quantité de matière (en mol)
- R est la constante des gaz parfaits (R = 8,314 J·mol⁻¹·K⁻¹)
- T est la température absolue (en K)

## Transformations thermodynamiques

### Transformation isotherme
Une transformation isotherme se déroule à température constante (T = constante).

Pour un gaz parfait : **PV = constante**

### Transformation isobare
Une transformation isobare se déroule à pression constante (P = constante).

Pour un gaz parfait : **V/T = constante**

### Transformation isochore
Une transformation isochore se déroule à volume constant (V = constante).

Pour un gaz parfait : **P/T = constante**

### Transformation adiabatique
Une transformation adiabatique se déroule sans échange de chaleur avec l'extérieur (Q = 0).

Pour un gaz parfait : **PVᵞ = constante**

Où γ (gamma) est le coefficient de Laplace, défini par γ = Cp/Cv

## Énergie interne

L'énergie interne d'un gaz parfait ne dépend que de sa température :

**U = nCvT**

Où Cv est la capacité thermique à volume constant.

Pour un gaz parfait monoatomique : Cv = (3/2)R
Pour un gaz parfait diatomique : Cv = (5/2)R

## Premier principe de la thermodynamique

Le premier principe traduit la conservation de l'énergie :

**ΔU = W + Q**

Où :
- ΔU est la variation d'énergie interne
- W est le travail reçu par le système
- Q est la chaleur reçue par le système

## Travail des forces de pression

Le travail élémentaire des forces de pression s'écrit :

**δW = -PdV**

Pour une transformation de l'état A à l'état B :

**W = -∫(A→B) PdV**

## Applications

### Cycle de Carnot
Le cycle de Carnot est un cycle thermodynamique théorique composé de :
1. Une détente isotherme
2. Une détente adiabatique
3. Une compression isotherme
4. Une compression adiabatique

C'est le cycle le plus efficace possible entre deux sources de chaleur.

### Machines thermiques
Les machines thermiques (moteurs, réfrigérateurs) utilisent les propriétés des gaz pour produire du travail ou transférer de la chaleur.

Le rendement d'un moteur thermique est toujours inférieur au rendement de Carnot :

**η = W/Qchaud < ηCarnot = 1 - Tfroid/Tchaud**
