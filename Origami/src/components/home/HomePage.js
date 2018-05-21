import React from "react";
import { PropTypes } from "prop-types";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { BounceLoader } from "react-spinners";
import {
  is_cloudcv,
  getAllDemosByCloudCV
} from "../../api/Generic/getCloudCVDemos";
import { getAllDeployed } from "../../api/Nongh/getAllDeployed";
import { getSearchedDemos } from "../../api/Nongh/getSearchedDemos";
import HomePageDemoCard from "../stateless/homePageDemoCard";
import { getAllPermalink } from "../../api/Nongh/permalink";
import * as loginActions from "../../actions/loginActions";
import {
  Layout,
  Menu,
  Icon,
  Button,
  Card,
  Row,
  Col,
  Input,
  Select,
  Modal
} from "antd";
import toastr from "toastr";
import { SocialDialog } from "../social/SocialDialog";
import { trimAndPad } from "../../utils/generalUtils";
import { DEMO_CARD_DESCRIP_MAX_LEN } from "../../constants";

const { Header, Content, Footer } = Layout;
const Option = Select.Option;
const demoSpinnerStyle = {
  position: "fixed",
  top: "50%",
  left: "50%"
};

class HomePage extends React.Component {
  constructor(props, context) {
    super(props, context);
    // this.buildFromGithubLogin = this.buildFromGithubLogin.bind(this);
    this.useLocalDeploymentLogin = this.useLocalDeploymentLogin.bind(this);
    $("#appbar-progress").progress({
      percent: "0%"
    });

    this.state = {
      is_cloudcv: false,
      rootData: {},
      allDeployed: [],
      demoBeingShown: {},
      permalinkHolder: {},
      shareModalOpen: false,
      searchBy: "demo",
      demoLoading: true
    };

    this.handleShareModal = this.handleShareModal.bind(this);
    this.goToDemoPage = this.goToDemoPage.bind(this);
    this.findDemo = this.findDemo.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.initiateLogin = this.initiateLogin.bind(this);
    this.getDocs = this.getDocs.bind(this);
    this.success = this.success.bind(this);
  }

  componentWillMount() {
    getAllDeployed()
      .then(alldeployedRepos => {
        let tmp = JSON.parse(alldeployedRepos);
        let allDeployed = [];
        while (tmp.length) {
          allDeployed.push(tmp.splice(0, 4));
        }
        this.setState({ allDeployed });
        this.setState({ demoLoading: false });
      })
      .then(() => {
        const stateToPut = {};
        getAllPermalink().then(data => {
          JSON.parse(data).map(perma => {
            if (!stateToPut[perma.proect_id]) {
              stateToPut[perma.project_id] = {};
            }

            let permalink = `${window.location.protocol}//${
              window.location.host
            }${perma.short_relative_url}`;
            perma.permalink = permalink;
            stateToPut[perma.project_id] = perma;
            this.setState({
              permalinkHolder: Object.assign({}, stateToPut)
            });
          });
        });
      })
      .catch(err => {
        toastr.error(err);
      });
  }

  handleShareModal(demoBeingShown) {
    let id = demoBeingShown.id;
    if (demoBeingShown !== false)
      demoBeingShown.permalink = this.state.permalinkHolder[id].permalink;
    this.setState({ demoBeingShown }, () => {
      this.setState({ shareModalOpen: !this.state.shareModalOpen });
    });
  }
  success() {
    const modal = Modal.info({
      title: "Logging you in"
    });
    setTimeout(() => modal.destroy(), 2000);
  }

  useLocalDeploymentLogin() {
    if (!this.props.login) {
      $(".loginButton").trigger("click");
    } else {
      this.props.history.push("/ngh/user");
    }
  }

  goToDemoPage(demo) {
    this.props.history.push(
      this.state.permalinkHolder[demo.id].short_relative_url
    );
  }

  findDemo(search_term) {
    getSearchedDemos(this.state.searchBy, search_term)
      .then(allRepos => {
        if (Object.keys(JSON.parse(allRepos)).length > 0) {
          let tmp = JSON.parse(allRepos);
          let allDeployed = [];
          while (tmp.length) {
            allDeployed.push(tmp.splice(0, 4));
          }
          this.setState({
            allDeployed
          });
        } else {
          this.setState({ allDeployed: [] });
        }
      })
      .then(() => {
        const stateToPut = {};
        getAllPermalink().then(data => {
          JSON.parse(data).map(perma => {
            if (!stateToPut[perma.user_id]) {
              stateToPut[perma.user_id] = {};
            }
            stateToPut[perma.project_id] = perma;
            this.setState({
              permalinkHolder: Object.assign({}, stateToPut)
            });
          });
        });
      })
      .catch(err => {
        toastr.error(err);
      });
  }

  handleClick(e) {
    if (!this.state.login && e.key === "2") {
      this.initiateLogin();
    } else if (e.key === "3") {
      this.getDocs();
    }
  }

  initiateLogin() {
    this.success();
    window.location = "/auth/github/login/";
  }

  getDocs() {
    window.location =
      "http://cloudcv-origami.readthedocs.io/en/latest/index.html";
  }

  render() {
    return (
      <Layout style={{ background: "#FEFEFE" }}>

        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
          <div
            style={{ padding: 12, background: "#FEFEFE", textAlign: "center" }}
          >
            {this.state.demoLoading ? (
              <div className="demoSpinner" style={demoSpinnerStyle}>
                <BounceLoader color={"#33aadd"} size={80} />
              </div>
            ) : (
              <Row>
                {Object.keys(this.state.allDeployed).length > 0 ? (
                  this.state.allDeployed.map(row => (
                    <div key={Math.random()}>
                      <Row>
                        {row.map(demo => (
                          <Col span={5} offset={1} key={demo.id}>
                            <Card
                              style={{ width: "100%" }}
                              bodyStyle={{ padding: 0 }}
                            >
                              <div className="custom-card">
                                <br />
                                <h3>{demo.name}</h3>
                                <h4> - {demo.username}</h4>
                                <br />
                                <p />
                              </div>
                              <div className="custom-image">
                                <img width="100%" src={demo.cover_image} />
                              </div>
                              <div className="custom-card">
                                <p>
                                  {trimAndPad(
                                    demo.description,
                                    DEMO_CARD_DESCRIP_MAX_LEN
                                  )}
                                </p>
                                <br />
                                <Row>
                                  <Col span={11} offset={1}>
                                    <Button
                                      type="primary"
                                      id="launchButton"
                                      style={{ marginBottom: "5%" }}
                                      onClick={() => this.goToDemoPage(demo)}
                                    >
                                      Demo<Icon type="rocket" />
                                    </Button>
                                  </Col>
                                  <Col span={10} offset={1}>
                                    <Button
                                      type="primary"
                                      style={{ width: "100%" }}
                                      onClick={() =>
                                        this.handleShareModal(demo)
                                      }
                                    >
                                      Share<Icon type="share-alt" />
                                    </Button>
                                  </Col>
                                </Row>
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                      <br />
                    </div>
                  ))
                ) : (
                  <Col span={24} style={{ width: "100%" }}>
                    <h4> Demo not found. Try Searching for another demo</h4>
                  </Col>
                )}
              </Row>
            )}
          </div>
        </Content>

        <SocialDialog
          shareModalOpen={this.state.shareModalOpen}
          handleShareModal={this.handleShareModal.bind(this)}
          demoBeingShown={this.state.demoBeingShown}
        />
      </Layout>
    );
  }
}

HomePage.propTypes = {
  loginactions: PropTypes.object.isRequired,
  login: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    login: state.login
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loginactions: bindActionCreators(loginActions, dispatch)
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(HomePage)
);
