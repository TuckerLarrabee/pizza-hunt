const { param } = require('express/lib/request');
const {Comment, Pizza} = require('../models');

const commentController = {
    // add comment to pizza
    addComment({ params, body }, res) {
        console.log(body);
        Comment.create(body)
          .then(({ _id }) => {
            console.log(_id)
            return Pizza.findOneAndUpdate(
                {_id: params.pizzaId},
                {$push: { comments: _id} },
                { new: true }
            );
          })
          .then(dbPizzaData => {
              if (!dbPizzaData) {
                  res.status(404).json({message: "No pizza found with this id!" });
                  return;
              }
              res.json(dbPizzaData)
          })
          .catch(err => console.log(err))
      },

    addReply({params, body}, res) {
        Comment.findOneAndUpdate(
            { _id: params.commentId},
            { $push: { replies: body}},
            { new: true, runValidators: true }
        )
        .then(dbPizzaData => {
            if (!dbPizzaData) {
                res.status(404).json({ message: 'No pizza found with this id!'});
                return;
            }
            res.json(dbPizzaData);
        })
        .catch(err => res.json(err));
      },

    removeReply({params}, res) {
        Comment.findOneAndUpdate(
            { _id: params.commentId},
            { $pull: { replies: { replyId: params.replyId}}},
            { new: true}
        )          
        .then(dbPizzaData => res.json(dbPizzaData))
        .catch(err => res.json(err))
      },

    //remove comment
    removeComment({params}, res) {
        console.log(params);
        Comment.findOneAndDelete({_id: params.commentId})
        .then(deletedComment => {
            if (!deletedComment) {
                return res.status(404).json({message: "No comment with this id!" });
            }
            return Pizza.findOneAndUpdate(
                { _id: params.pizzaId},
                { $pull: { comments: params.commentId }},
                { new: true}
            );
        })
        .then(dbPizzaData => {
            if (!dbPizzaData) {
                res.status(404).json({message: "No piza found with this id!" })
                return;
            }
            res.json(true);
        })
        .catch(err => res.json(err));
    }
}

module.exports = commentController;