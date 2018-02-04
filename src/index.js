const isEqual = require('lodash.isequal');

const evaluate = (condition, target = null) => {
  if (typeof condition === 'boolean') {
    return condition;
  }
  if (!Array.isArray(condition)) {
    return false;
  }
  if (condition.length < 2) {
    return false;
  }
  if (typeof condition[0] !== 'string') {
    return false;
  }

  // Identify the comparative target
  const comparative = target ? target[condition[1]] : condition[1];

  // Evaluate the condition
  switch (condition[0].toLowerCase()) {
    // Existence
    case 'exists':
    case 'exist':
      return ((typeof comparative !== 'undefined' && comparative !== null));
    case '!exist':
    case '!exists':
      return ((typeof comparative === 'undefined' || comparative === null));

    // Comparison Conditions
    case '==':
      return (isEqual(comparative, condition[2]));
    case '!=':
      return (!isEqual(comparative, condition[2]));
    case '>':
    case '>=':
    case '<':
    case '<=': {
      if (typeof comparative !== 'number' || typeof condition[2] !== 'number') {
        return false;
      }
      switch (condition[0]) {
        case '>':
          return (comparative > condition[2]);
        case '>=':
          return (comparative >= condition[2]);
        case '<':
          return (comparative < condition[2]);
        case '<=':
          return (comparative <= condition[2]);
        default:
          return false;
      }
    }

    // Membership
    case 'in': {
      if (Array.isArray(comparative)) {
        return comparative.reduce((carry, comp) => carry || condition.slice(2).indexOf(comp) > -1, false);
      }
      return condition.slice(2).indexOf(comparative) > -1;
    }
    case '!in': {
      if (Array.isArray(comparative)) {
        return comparative.reduce((carry, comp) => carry || condition.slice(2).indexOf(comp) === -1, false);
      }
      return condition.slice(2).indexOf(comparative) === -1;
    }

    // Combining
    case 'all': {
      return condition.slice(1).reduce((carry, cond) => (carry && evaluate(cond, target)), true);
    }
    case 'any': {
      return condition.slice(1).reduce((carry, cond) => (carry || evaluate(cond, target)), false);
    }
    case 'none': {
      return !condition.slice(1).reduce((carry, cond) => (carry || evaluate(cond, target)), false);
    }

    // Otherwise ...
    default:
      return false;
  }
};

module.exports = { evaluate };
